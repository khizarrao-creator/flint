import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ManufacturingService {
    constructor(private readonly prisma: PrismaService) { }

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
            }
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
        const { productId, items, code, yieldQuantity, yieldPercentage, type, description, ...rest } = data;

        const formula = await this.prisma.formula.create({
            data: {
                ...rest,
                code: code || `BOM-${Date.now()}`,
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
    }

    async updateFormula(tenantId, id, data) {
        const { items, yieldQuantity, ...rest } = data;
        return this.prisma.$transaction(async (tx) => {
            const updateData: any = { ...rest };
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
                }
            },
            orderBy: { plannedStart: 'desc' }
        });
    }

    async createWorkOrder(tenantId: string, data: any) {
        const { quantity, startDate, dueDate, bomId, warehouseId, code, priority, notes } = data;

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
                completedQuantity: 0
            }
        });
    }
}
