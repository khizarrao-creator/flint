import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.customer.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.customer.findFirst({
            where: { id, tenantId },
        });
    }

    async create(tenantId: string, data: any) {
        const { email, password, ...rest } = data;
        const finalCode = rest.code || `CUS-${Date.now()}`;

        // Check if code already exists for this tenant
        const existing = await this.prisma.customer.findUnique({
            where: {
                tenantId_code: {
                    tenantId,
                    code: finalCode,
                },
            },
        });

        if (existing) {
            throw new BadRequestException('Customer with this code already exists');
        }

        return this.prisma.customer.create({
            data: {
                ...rest,
                code: finalCode,
                tenantId,
                contactInfo: email ? { email } : undefined,
            },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        const { email, password, ...rest } = data;

        let updateData = { ...rest };
        if (email) {
            updateData.contactInfo = { email };
        }

        return this.prisma.customer.update({
            where: { id, tenantId },
            data: updateData,
        });
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.customer.delete({
            where: { id, tenantId },
        });
    }
}
