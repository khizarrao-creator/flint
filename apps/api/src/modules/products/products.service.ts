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
}
