import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssetsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.asset.findMany({
            where: {
                tenantId: tenantId
            },
            include: {
                category: true,
                warehouse: true,
                allocations: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(tenantId, id) {
        return this.prisma.asset.findFirst({
            where: { id, tenantId },
            include: {
                category: true,
                warehouse: true,
                allocations: true
            }
        });
    }

    async create(tenantId: string, data: any) {
        let categoryId = data.categoryId;

        if (!categoryId) {
            const defaultCat = await this.prisma.assetCategory.findFirst({
                where: { tenantId, name: 'General Assets' }
            });
            if (defaultCat) {
                categoryId = defaultCat.id;
            } else {
                const newCat = await this.prisma.assetCategory.create({
                    data: { tenantId, name: 'General Assets', code: `ASSET-CAT-${Date.now()}` }
                });
                categoryId = newCat.id;
            }
        }

        const { code, purchaseCost, currentValue, usefulLife, ...rest } = data;

        return this.prisma.asset.create({
            data: {
                ...rest,
                code: code || `AST-${Date.now()}`,
                purchaseCost: purchaseCost || 0,
                currentValue: currentValue || purchaseCost || 0,
                usefulLife: usefulLife || 5, // Default 5 years
                tenantId,
                categoryId
            }
        });
    }

    async update(tenantId, id, data) {
        return this.prisma.asset.update({
            where: { id, tenantId },
            data
        });
    }

    async delete(tenantId, id) {
        return this.prisma.asset.delete({ where: { id, tenantId } });
    }
}
