import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaxRatesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(tenantId: string) {
        const now = new Date();
        return this.prisma.taxRate.findMany({
            where: {
                tenantId,
                isActive: true,
                effectiveFrom: { lte: now },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: now } },
                ],
            },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.taxRate.findFirst({
            where: { id, tenantId },
        });
    }

    async create(tenantId: string, data: any) {
        return this.prisma.taxRate.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        return this.prisma.taxRate.update({
            where: { id },
            data,
        });
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.taxRate.delete({
            where: { id },
        });
    }
}
