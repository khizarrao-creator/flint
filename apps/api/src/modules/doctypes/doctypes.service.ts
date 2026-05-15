import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocTypesService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.docType.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.docType.findFirst({
            where: { id, tenantId },
        });
    }

    async create(tenantId: string, data: any) {
        return this.prisma.docType.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        return this.prisma.docType.update({
            where: { id, tenantId },
            data,
        });
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.docType.delete({
            where: { id, tenantId },
        });
    }
}
