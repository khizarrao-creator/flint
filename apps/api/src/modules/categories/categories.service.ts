
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.category.findMany({
            where: { tenantId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.category.findFirst({
            where: { id, tenantId },
        });
    }

    async create(tenantId: string, data: any) {
        const finalCode = data.code || `CAT-${Date.now()}`;

        // Check if code already exists for this tenant
        const existing = await this.prisma.category.findUnique({
            where: {
                tenantId_code: {
                    tenantId,
                    code: finalCode,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Category with this code already exists');
        }

        return this.prisma.category.create({
            data: {
                ...data,
                code: finalCode,
                tenantId,
            },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        return this.prisma.category.update({
            where: { id, tenantId },
            data,
        });
    }

    async remove(tenantId: string, id: string) {
        // Check if there are products in this category
        const productsCount = await this.prisma.product.count({
            where: { categoryId: id },
        });

        if (productsCount > 0) {
            throw new BadRequestException('Cannot delete category with associated products');
        }

        return this.prisma.category.delete({
            where: { id, tenantId },
        });
    }
}
