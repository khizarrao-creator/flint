import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats(tenantId: string) {
        const [revenue, ordersCount, customerCount, productsCount] = await Promise.all([
            this.prisma.salesOrder.aggregate({
                where: { tenantId, status: 'DELIVERED' },
                _sum: { totalAmount: true },
            }),
            this.prisma.salesOrder.count({ where: { tenantId } }),
            this.prisma.customer.count({ where: { tenantId } }),
            this.prisma.product.count({ where: { tenantId } }),
        ]);

        return {
            totalRevenue: revenue._sum.totalAmount || 0,
            activeOrders: ordersCount,
            customers: customerCount,
            products: productsCount,
        };
    }
}
