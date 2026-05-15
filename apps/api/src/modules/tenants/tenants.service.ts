import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FinancesService } from '../finances/finances.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
    constructor(
        private prisma: PrismaService,
        private financesService: FinancesService
    ) { }

    async onboard(data: {
        name: string;
        subdomain: string;
        adminEmail: string;
        adminUsername: string;
        adminPass: string;
        isDemo?: boolean;
        expiresAt?: string;
    }) {
        console.log('Onboarding Tenant with data:', JSON.stringify(data, null, 2));
        return this.prisma.$transaction(async (tx) => {
            // 1. Validate Subdomain
            const existing = await tx.tenant.findUnique({
                where: { subdomain: data.subdomain },
            });

            if (existing) {
                throw new BadRequestException('Subdomain already in use');
            }

            // 2. Create the Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: data.name,
                    subdomain: data.subdomain,
                    isActive: true,
                    isTrial: data.isDemo || false,
                    trialEndsAt: data.expiresAt ? new Date(data.expiresAt) : null,
                    companyEmail: data.adminEmail, // Required in new schema
                },
            });

            // 3. Create the Admin User for this Tenant
            const hashedPassword = await bcrypt.hash(data.adminPass, 10);
            await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    email: data.adminEmail.toLowerCase(),
                    username: data.adminUsername,
                    passwordHash: hashedPassword,
                    role: 'ADMIN',
                }
            });

            // 4. Initialize Financial Accounts
            // We pass the transaction client (tx) so it can see the new tenant 
            // before it's committed to the main database connection
            await this.financesService.initializeTenantAccounts(tenant.id, tx);

            return tenant;
        });
    }

    async findAll() {
        return this.prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, products: true, salesOrders: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                users: { select: { id: true, email: true, username: true, role: true } },
            },
        });
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }

    async update(id: string, data: any) {
        return this.prisma.tenant.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        // Comprehensive Cascade Deletion for Tenant
        return this.prisma.$transaction(async (tx) => {
            // 0. Detach Self-Referencing Relations to prevent FK loops
            await tx.account.updateMany({ where: { tenantId: id }, data: { parentId: null } });
            await tx.category.updateMany({ where: { tenantId: id }, data: { parentId: null } });
            await tx.assetCategory.updateMany({ where: { tenantId: id }, data: { parentId: null } });

            // 1. Delete Dependent Child Tables (No tenantId directly)
            await tx.invoiceItem.deleteMany({ where: { invoice: { tenantId: id } } });
            await tx.deliveryItem.deleteMany({ where: { deliveryNote: { tenantId: id } } });
            await tx.transferItem.deleteMany({ where: { transfer: { tenantId: id } } });
            await tx.assetAllocation.deleteMany({ where: { asset: { tenantId: id } } });
            await tx.dashboardReport.deleteMany({ where: { dashboard: { tenantId: id } } });

            // 2. Delete Manufacturing & Production
            await tx.workOrderItem.deleteMany({ where: { tenantId: id } });
            await tx.productionLine.deleteMany({ where: { tenantId: id } });
            await tx.workOrder.deleteMany({ where: { tenantId: id } });
            await tx.productionPlan.deleteMany({ where: { tenantId: id } });
            await tx.formulaItem.deleteMany({ where: { tenantId: id } });
            await tx.formula.deleteMany({ where: { tenantId: id } });

            // 3. Delete Assets
            await tx.assetMaintenance.deleteMany({ where: { tenantId: id } });
            await tx.assetDepreciation.deleteMany({ where: { tenantId: id } });
            await tx.asset.deleteMany({ where: { tenantId: id } });
            await tx.assetCategory.deleteMany({ where: { tenantId: id } });

            // 4. Delete Inventory
            await tx.stockMovement.deleteMany({ where: { tenantId: id } });
            await tx.stockAdjustment.deleteMany({ where: { tenantId: id } });
            await tx.stockTake.deleteMany({ where: { tenantId: id } });
            await tx.transfer.deleteMany({ where: { tenantId: id } });
            await tx.stockItem.deleteMany({ where: { tenantId: id } });  // Depends on Product, Warehouse

            // 5. Delete Orders & Transactions
            await tx.orderItem.deleteMany({ where: { tenantId: id } }); // Depends on Orders
            await tx.deliveryNote.deleteMany({ where: { tenantId: id } });
            await tx.payment.deleteMany({ where: { tenantId: id } });
            await tx.transaction.deleteMany({ where: { tenantId: id } });
            await tx.expense.deleteMany({ where: { tenantId: id } });
            await tx.invoice.deleteMany({ where: { tenantId: id } });
            await tx.salesOrder.deleteMany({ where: { tenantId: id } });
            await tx.purchaseOrder.deleteMany({ where: { tenantId: id } });
            await tx.quotation.deleteMany({ where: { tenantId: id } });

            // 6. Delete Core Financials
            await tx.journal.deleteMany({ where: { tenantId: id } });
            await tx.account.deleteMany({ where: { tenantId: id } });

            // 7. Delete Product Catalog & Warehousing
            await tx.product.deleteMany({ where: { tenantId: id } });
            await tx.warehouse.deleteMany({ where: { tenantId: id } });
            await tx.brand.deleteMany({ where: { tenantId: id } });
            await tx.category.deleteMany({ where: { tenantId: id } });
            await tx.unitOfMeasure.deleteMany({ where: { tenantId: id } });
            await tx.taxRate.deleteMany({ where: { tenantId: id } });

            // 8. Delete CRM & Settings
            await tx.customer.deleteMany({ where: { tenantId: id } });
            await tx.supplier.deleteMany({ where: { tenantId: id } });
            await tx.paymentTerm.deleteMany({ where: { tenantId: id } });
            await tx.shippingMethod.deleteMany({ where: { tenantId: id } });
            await tx.approval.deleteMany({ where: { tenantId: id } });
            await tx.docSequence.deleteMany({ where: { tenantId: id } });
            await tx.docType.deleteMany({ where: { tenantId: id } });
            await tx.flag.deleteMany({ where: { tenantId: id } });
            await tx.dashboard.deleteMany({ where: { tenantId: id } });
            await tx.report.deleteMany({ where: { tenantId: id } });

            // 9. Delete System & Logs
            await tx.userSession.deleteMany({ where: { tenantId: id } });
            await tx.apiKey.deleteMany({ where: { tenantId: id } });
            await tx.auditLog.deleteMany({ where: { tenantId: id } });
            await tx.notificationLog.deleteMany({ where: { tenantId: id } });
            await tx.user.deleteMany({ where: { tenantId: id } });

            // 10. Finally, delete the Tenant
            return tx.tenant.delete({
                where: { id },
            });
        });
    }
}
