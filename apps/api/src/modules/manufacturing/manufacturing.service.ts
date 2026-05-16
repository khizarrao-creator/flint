import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ManufacturingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly productsService: ProductsService
    ) { }

    // -------------------------
    // FORMULAS (BOM)
    // -------------------------
    private mapFormula(formula: any) {
        if (!formula) return null;
        return {
            ...formula,
            yieldQuantity: formula.batchSize,
        };
    }

    async findAllFormulas(tenantId: string) {
        const formulas = await this.prisma.formula.findMany({
            where: { tenantId },
            include: {
                product: true,
                items: {
                    include: {
                        product: true,
                    }
                }
            },
            orderBy: [
                { productId: 'asc' },
                { version: 'desc' }
            ]
        });
        return formulas.map(f => this.mapFormula(f));
    }

    async findOneFormula(tenantId, id) {
        const formula = await this.prisma.formula.findFirst({
            where: { id, tenantId },
            include: {
                product: true, items: { include: { product: true } }
            }
        });
        return this.mapFormula(formula);
    }

    async createFormula(tenantId: string, data: any) {
        const { productId, items, code, version, yieldQuantity, yieldPercentage, type, description, isActive, ...rest } = data;

        return this.prisma.$transaction(async (tx) => {
            // If this formula is marked as active, deactivate others for the same product
            if (isActive) {
                await tx.formula.updateMany({
                    where: { tenantId, productId, isActive: true },
                    data: { isActive: false }
                });
            }

            const formula = await tx.formula.create({
                data: {
                    ...rest,
                    code: code || `BOM-${Date.now()}`,
                    version: version || "1.0",
                    isActive: isActive !== undefined ? isActive : true,
                    batchSize: yieldQuantity || 1,
                    yield: yieldPercentage || 100,
                    instructions: description,
                    tenantId,
                    product: { connect: { id: productId } },
                    items: {
                        create: (items || []).map((item, index) => ({
                            tenantId,
                            productId: item.productId,
                            quantity: item.quantity,
                            cost: item.unitCost || 0,
                            sequence: index + 1
                        }))
                    }
                },
                include: { items: true }
            });
            return this.mapFormula(formula);
        });
    }

    async updateFormula(tenantId, id, data) {
        const { items, yieldQuantity, isActive, ...rest } = data;
        return this.prisma.$transaction(async (tx) => {
            const current = await tx.formula.findUnique({ where: { id } });

            // If activating, deactivate others
            if (isActive && !current!.isActive) {
                await tx.formula.updateMany({
                    where: { tenantId, productId: current!.productId, isActive: true },
                    data: { isActive: false }
                });
            }

            const updateData: any = { ...rest, isActive };
            if (yieldQuantity !== undefined) {
                updateData.batchSize = yieldQuantity;
            }

            await tx.formula.update({
                where: { id },
                data: updateData
            });

            if (items) {
                await tx.formulaItem.deleteMany({ where: { formulaId: id } });
                await tx.formulaItem.createMany({
                    data: items.map((item, index) => ({
                        tenantId,
                        formulaId: id,
                        productId: item.productId,
                        quantity: item.quantity,
                        cost: item.unitCost || 0,
                        sequence: index + 1
                    }))
                });
            }
            const formula = await tx.formula.findUnique({ where: { id }, include: { items: true } });
            return this.mapFormula(formula);
        });
    }

    async cloneFormula(tenantId: string, id: string, newVersion: string) {
        const source = await this.prisma.formula.findFirst({
            where: { id, tenantId },
            include: { items: true }
        });

        if (!source) throw new NotFoundException('Source formula not found');

        const { id: _, items, audit, metadata, ...baseData } = source;

        return this.createFormula(tenantId, {
            ...baseData,
            version: newVersion,
            isActive: false, // New clones are inactive by default
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitCost: item.cost
            }))
        });
    }

    async deleteFormula(tenantId, id) {
        return this.prisma.formula.delete({ where: { id } });
    }

    // -------------------------
    // WORK ORDERS
    // -------------------------
    async findAllWorkOrders(tenantId: string) {
        return this.prisma.workOrder.findMany({
            where: { tenantId },
            include: {
                formula: {
                    include: {
                        product: true
                    }
                },
                assignedTo: true,
                warehouse: true
            },
            orderBy: { plannedStart: 'desc' }
        });
    }

    async findOneWorkOrder(tenantId: string, id: string) {
        return this.prisma.workOrder.findFirst({
            where: { id, tenantId },
            include: {
                formula: {
                    include: {
                        product: true,
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                assignedTo: true,
                warehouse: true,
                productionLines: true
            }
        });
    }

    async createWorkOrder(tenantId: string, data: any) {
        const { quantity, startDate, dueDate, bomId, warehouseId, code, priority, notes, assignedToId } = data;

        let finalWarehouseId = warehouseId;
        if (!finalWarehouseId || finalWarehouseId === 'DEFAULT_WH') {
            const firstWh = await this.prisma.warehouse.findFirst({
                where: { tenantId, isActive: true },
                orderBy: { name: 'asc' }
            });
            if (firstWh) {
                finalWarehouseId = firstWh.id;
            } else {
                throw new BadRequestException('No active warehouse found for this tenant. Please register a warehouse first.');
            }
        }

        return this.prisma.workOrder.create({
            data: {
                tenantId,
                code: code || `WO-${Date.now()}`,
                quantity,
                plannedStart: startDate ? new Date(startDate) : new Date(),
                plannedFinish: dueDate ? new Date(dueDate) : undefined,
                status: 'PLANNED',
                priority: priority ? String(priority) : 'NORMAL',
                notes: notes || undefined,
                formulaId: bomId,
                warehouseId: finalWarehouseId,
                assignedToId: assignedToId || undefined,
                completedQuantity: 0
            }
        });
    }

    async updateWorkOrder(tenantId: string, id: string, data: any) {
        const { startDate, dueDate, actualStart, actualFinish, ...rest } = data;

        return this.prisma.$transaction(async (tx) => {
            const current = await tx.workOrder.findUnique({
                where: { id },
                include: {
                    formula: {
                        include: {
                            items: {
                                include: { product: true }
                            }
                        }
                    }
                }
            });

            if (!current) throw new NotFoundException('Work order not found');

            const updateData: any = { ...rest };
            if (startDate) updateData.plannedStart = new Date(startDate);
            if (dueDate) updateData.plannedFinish = new Date(dueDate);
            if (actualStart) updateData.actualStart = new Date(actualStart);
            if (actualFinish) updateData.actualFinish = new Date(actualFinish);

            // Handle Status Transition Logic
            if (data.status && data.status !== current.status) {

                // 1. Starting Production (PLANNED/RELEASED -> IN_PROGRESS)
                if (data.status === 'IN_PROGRESS' && current.status !== 'IN_PROGRESS') {
                    if (!updateData.actualStart) updateData.actualStart = new Date();

                    // Validate Stock Availability First
                    for (const item of current.formula.items) {
                        const requiredQty = Number(item.quantity) * Number(current.quantity);
                        const stockItem = await tx.stockItem.findFirst({
                            where: { tenantId, productId: item.productId, warehouseId: current.warehouseId }
                        });

                        if (!stockItem || Number(stockItem.availableQuantity) < requiredQty) {
                            throw new BadRequestException(`Insufficient stock for ${item.product?.name || item.productId}. Required: ${requiredQty}, Available: ${stockItem?.availableQuantity || 0}`);
                        }
                    }

                    // Deduct Raw Materials (Backflushing)
                    for (const item of current.formula.items) {
                        const requiredQty = Number(item.quantity) * Number(current.quantity);
                        await this.productsService.adjustStock(tx, tenantId, {
                            productId: item.productId,
                            warehouseId: current.warehouseId,
                            quantityChange: -requiredQty,
                            referenceType: 'MANUFACTURING',
                            referenceId: current.id,
                            movementType: 'MANUFACTURING',
                            reason: `Material consumption for WO ${current.code}`
                        });
                    }
                }

                // 2. Completing Production (-> COMPLETED)
                if (data.status === 'COMPLETED' && current.status !== 'COMPLETED') {
                    if (!updateData.actualFinish) updateData.actualFinish = new Date();

                    const yieldQty = data.completedQuantity !== undefined
                        ? Number(data.completedQuantity)
                        : Number(current.quantity);

                    updateData.completedQuantity = yieldQty;

                    const product = await tx.product.findUnique({
                        where: { id: current.formula.productId }
                    });

                    // Handle Serialized Tracking
                    if (product?.trackSerial) {
                        const serials = data.serialNumbers || [];
                        if (serials.length < yieldQty) {
                            throw new BadRequestException(`Product ${product.name} requires ${yieldQty} serial numbers, but only ${serials.length} provided.`);
                        }

                        for (const sn of serials) {
                            await this.productsService.adjustStock(tx, tenantId, {
                                productId: current.formula.productId,
                                warehouseId: current.warehouseId,
                                quantityChange: 1, // One per serial
                                referenceType: 'MANUFACTURING',
                                referenceId: current.id,
                                movementType: 'MANUFACTURING',
                                serialNumber: sn,
                                batchNumber: (current as any).batchNumber || current.code,
                                reason: `Production yield (Serial ${sn}) for WO ${current.code}`
                            });
                        }
                    } else {
                        // Regular or Batch Tracking
                        await this.productsService.adjustStock(tx, tenantId, {
                            productId: current.formula.productId,
                            warehouseId: current.warehouseId,
                            quantityChange: yieldQty,
                            referenceType: 'MANUFACTURING',
                            referenceId: current.id,
                            movementType: 'MANUFACTURING',
                            batchNumber: (current as any).batchNumber || current.code,
                            reason: `Production yield for WO ${current.code}`
                        });
                    }
                }

                // 3. Cancelling (-> CANCELLED)
                if (data.status === 'CANCELLED' && current.status === 'IN_PROGRESS') {
                    // Return materials if they were already deducted
                    for (const item of current.formula.items) {
                        const requiredQty = Number(item.quantity) * Number(current.quantity);
                        await this.productsService.adjustStock(tx, tenantId, {
                            productId: item.productId,
                            warehouseId: current.warehouseId,
                            quantityChange: requiredQty,
                            referenceType: 'MANUFACTURING',
                            referenceId: current.id,
                            movementType: 'MANUFACTURING',
                            reason: `Material return (Cancellation) for WO ${current.code}`
                        });
                    }
                }
            }

            return tx.workOrder.update({
                where: { id },
                data: updateData
            });
        });
    }

    async deleteWorkOrder(tenantId: string, id: string) {
        return this.prisma.workOrder.delete({
            where: { id }
        });
    }

    // -------------------------
    // QUALITY CONTROL (QC)
    // -------------------------

    async getInspections(tenantId: string, workOrderId?: string) {
        return this.prisma.qualityInspection.findMany({
            where: {
                tenantId,
                ...(workOrderId ? { workOrderId } : {})
            },
            include: {
                inspector: { select: { username: true } },
                product: { select: { name: true, sku: true } }
            },
            orderBy: { inspectedAt: 'desc' }
        });
    }

    async createInspection(tenantId: string, data: any) {
        return this.prisma.qualityInspection.create({
            data: {
                ...data,
                tenantId,
                inspectedAt: new Date()
            }
        });
    }
}
