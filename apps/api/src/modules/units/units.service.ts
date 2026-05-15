import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UnitsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.unitOfMeasure.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.unitOfMeasure.findFirst({
            where: { id, tenantId },
        });
    }

    async create(tenantId: string, data: any) {
        return this.prisma.unitOfMeasure.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        return this.prisma.unitOfMeasure.update({
            where: { id },
            data,
        });
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.unitOfMeasure.delete({
            where: { id },
        });
    }
}
