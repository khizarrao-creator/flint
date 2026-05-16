import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    private mapProduct(product: any) {
        if (!product) return null;
        return {
            ...product,
            stockQuantity: product.totalQuantity,
            minStockLevel: product.reorderPoint,
        };
    }

    async findAll(tenantId: string) {
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            include: { category: true },
            orderBy: { name: 'asc' },
        });
        return products.map(p => this.mapProduct(p));
    }

    async findOne(tenantId: string, id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: { category: true },
        });
        return this.mapProduct(product);
    }

    async create(tenantId: string, data: any) {
        const { stockQuantity, minStockLevel, ...rest } = data;

        // Check if sku already exists for this tenant
        const existing = await this.prisma.product.findUnique({
            where: {
                tenantId_sku: {
                    tenantId,
                    sku: rest.sku,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Product with this SKU already exists');
        }

        const product = await this.prisma.product.create({
            data: {
                ...rest,
                totalQuantity: stockQuantity || 0,
                availableQuantity: stockQuantity || 0,
                reorderPoint: minStockLevel || 0,
                tenantId,
            },
        });
        return this.mapProduct(product);
    }

    async update(tenantId: string, id: string, data: any) {
        const { stockQuantity, minStockLevel, ...rest } = data;

        const updateData: any = { ...rest };
        if (stockQuantity !== undefined) {
            updateData.totalQuantity = stockQuantity;
            updateData.availableQuantity = stockQuantity; // Simple sync for now
        }
        if (minStockLevel !== undefined) {
            updateData.reorderPoint = minStockLevel;
        }

        const product = await this.prisma.product.update({
            where: { id, tenantId },
            data: updateData,
        });
        return this.mapProduct(product);
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.product.delete({
            where: { id, tenantId },
        });
    }

    /**
     * Internal helper to adjust stock across all related entities
     * Should be called within a transaction (tx)
     */
    async adjustStock(tx: any, tenantId: string, data: {
        productId: string;
        warehouseId: string;
        quantityChange: number;
        referenceType: string;
        referenceId: string;
        movementType?: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'MANUFACTURING' | 'TRANSFER';
        reason?: string;
        batchNumber?: string;
        serialNumber?: string;
        expiryDate?: Date;
    }) {
        // 1. Find or create StockItem for this warehouse/product/batch/serial group
        let stockItem = await tx.stockItem.findFirst({
            where: { 
                tenantId, 
                productId: data.productId, 
                warehouseId: data.warehouseId,
                batchNumber: data.batchNumber || null,
                serialNumber: data.serialNumber || null
            }
        });

        if (!stockItem) {
            stockItem = await tx.stockItem.create({
                data: {
                    tenantId,
                    productId: data.productId,
                    warehouseId: data.warehouseId,
                    batchNumber: data.batchNumber,
                    serialNumber: data.serialNumber,
                    expiryDate: data.expiryDate,
                    quantity: 0,
                    availableQuantity: 0
                }
            });
        }

        const quantityBefore = Number(stockItem.quantity);
        const quantityAfter = quantityBefore + data.quantityChange;

        // 2. Update StockItem levels
        await tx.stockItem.update({
            where: { id: stockItem.id },
            data: {
                quantity: quantityAfter,
                availableQuantity: Number(stockItem.availableQuantity) + data.quantityChange
            }
        });

        // 3. Create Audit-ready StockMovement record
        await tx.stockMovement.create({
            data: {
                tenantId,
                stockItemId: stockItem.id,
                referenceType: data.referenceType,
                referenceId: data.referenceId,
                movementType: data.movementType || (data.quantityChange > 0 ? 'PURCHASE' : 'SALE'),
                quantityBefore,
                quantityChange: data.quantityChange,
                quantityAfter,
                reason: data.reason || `${data.referenceType} movement`,
                metadata: {
                    batchNumber: data.batchNumber,
                    serialNumber: data.serialNumber
                }
            }
        });

        // 4. Synchronize Global Product Totals (Product total is aggregate of all batches/warehouses)
        await tx.product.update({
            where: { id: data.productId },
            data: {
                totalQuantity: { increment: data.quantityChange },
                availableQuantity: { increment: data.quantityChange }
            }
        });

        return { quantityBefore, quantityAfter, stockItemId: stockItem.id };
    }
}
