import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.brand.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.brand.findFirst({
            where: { id, tenantId },
        });
    }

    async create(tenantId: string, data: any) {
        return this.prisma.brand.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        return this.prisma.brand.update({
            where: { id },
            data,
        });
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.brand.delete({
            where: { id },
        });
    }
}
