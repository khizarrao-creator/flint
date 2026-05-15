import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocType } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    // Helper to determine order type
    private async _isPurchase(tx: any, docTypeId?: string): Promise<boolean> {
        if (!docTypeId) return false;
        const docType = await tx.docType.findUnique({ where: { id: docTypeId } });
        return docType?.code?.startsWith('P') || false;
    }

    async findAll(tenantId: string) {
        const [sales, purchases] = await Promise.all([
            this.prisma.salesOrder.findMany({
                where: { tenantId },
                include: {
                    docType: true,
                    customer: true,
                    items: { include: { product: true } },
                },
                orderBy: { orderDate: 'desc' },
            }),
            this.prisma.purchaseOrder.findMany({
                where: { tenantId },
                include: {
                    docType: true,
                    supplier: true,
                    items: { include: { product: true } },
                },
                orderBy: { orderDate: 'desc' },
            })
        ]);

        // Merge and sort
        return [...sales, ...purchases].sort((a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
    }

    async findAllForCustomer(tenantId: string, customerId: string) {
        return this.prisma.salesOrder.findMany({
            where: { tenantId, customerId },
            include: {
                items: { include: { product: true } },
            },
            orderBy: { orderDate: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const sales = await this.prisma.salesOrder.findFirst({
            where: { id, tenantId },
            include: {
                customer: true,
                docType: true,
                items: { include: { product: true } },
            },
        });
        if (sales) return sales;

        return this.prisma.purchaseOrder.findFirst({
            where: { id, tenantId },
            include: {
                supplier: true,
                docType: true,
                items: { include: { product: true } },
            },
        });
    }

    async create(tenantId: string, data: any) {
        const { products, docTypeId, ...orderData } = data;

        return this.prisma.$transaction(async (tx) => {
            // 0. Resolve DocType
            let docType: DocType | null = null;
            if (docTypeId) {
                docType = await tx.docType.findUnique({ where: { id: docTypeId } }) as any;
            }
            const isPurchase = docType?.code?.startsWith('P'); // PO, PI, PR
            const isSales = docType?.code?.startsWith('S') || !docType; // Default to Sales if no DocType
            const isReturn = docType?.code?.endsWith('R'); // SR, PR

            // 1. Validate Product Stock (Only strictly for Sales)
            for (const item of products) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new BadRequestException(`Product ${item.productId} not found`);
                }

                if (isSales && !isReturn && Number(product.availableQuantity) < item.quantity) {
                    // throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`);
                    // Warn? Or Block? Let's allow negative stock for now to prevent blocking flow
                }
            }

            // 2. Create the Order and Line Items
            // Recalculate totals server-side for integrity
            let calculatedSubtotal = 0;
            let calculatedTax = 0;
            let calculatedDiscount = 0;

            const lineItems = products.map((p: any) => {
                const qty = Number(p.quantity);
                const price = Number(p.unitPrice);
                const discRate = Number(p.discount) || 0;
                const taxRate = Number(p.taxRate) || 0;

                const lineSubtotal = qty * price;
                const lineDiscount = lineSubtotal * (discRate / 100);
                const taxableAmount = lineSubtotal - lineDiscount;
                const lineTax = taxableAmount * (taxRate / 100);
                const lineTotal = lineSubtotal - lineDiscount + lineTax;

                calculatedSubtotal += lineSubtotal;
                calculatedDiscount += lineDiscount;
                calculatedTax += lineTax;

                return {
                    tenantId,
                    productId: p.productId,
                    quantity: qty,
                    unitPrice: price,
                    discountRate: discRate,
                    discountAmount: lineDiscount,
                    taxRate: taxRate,
                    taxAmount: lineTax,
                    lineTotal: lineTotal
                };
            });

            const calculatedTotal = calculatedSubtotal - calculatedDiscount + calculatedTax;
            const prefix = isPurchase ? 'PO' : (isReturn ? 'SR' : 'SO');
            const code = orderData.code || `${prefix}-${Date.now()}`; // Ensure code generation logic is robust

            let order;

            if (isPurchase) {
                order = await tx.purchaseOrder.create({
                    data: {
                        tenantId,
                        docTypeId,
                        supplierId: orderData.supplierId,
                        code,
                        status: orderData.status || 'DRAFT',
                        orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
                        subtotal: calculatedSubtotal,
                        discountAmount: calculatedDiscount,
                        taxAmount: calculatedTax,
                        totalAmount: calculatedTotal,
                        notes: orderData.notes,
                        items: { create: lineItems },
                    },
                    include: { items: true }
                });
            } else {
                order = await tx.salesOrder.create({
                    data: {
                        tenantId,
                        docTypeId,
                        customerId: orderData.customerId,
                        code,
                        status: orderData.status || 'DRAFT',
                        orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date(),
                        subtotal: calculatedSubtotal,
                        discountAmount: calculatedDiscount,
                        taxAmount: calculatedTax,
                        totalAmount: calculatedTotal,
                        notes: orderData.notes,
                        items: { create: lineItems },
                    },
                    include: { items: true }
                });
            }

            // 3. Update Inventory Stock
            for (const item of products) {
                const quantityChange = item.quantity;
                let operation: 'increment' | 'decrement' = 'decrement';

                if (isPurchase) {
                    // Purchase: Increment Stock. Purchase Return: Decrement.
                    operation = isReturn ? 'decrement' : 'increment';
                } else {
                    // Sales: Decrement Stock. Sales Return: Increment.
                    operation = isReturn ? 'increment' : 'decrement';
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        availableQuantity: { [operation]: quantityChange },
                        totalQuantity: { [operation]: quantityChange },
                    },
                });
            }

            // 4. Update Party Balance
            const balanceChange = isReturn ? -calculatedTotal : calculatedTotal;
            if (isSales && orderData.customerId) {
                await tx.customer.update({
                    where: { id: orderData.customerId },
                    data: { currentBalance: { increment: balanceChange } },
                });
            } else if (isPurchase && orderData.supplierId) {
                await tx.supplier.update({
                    where: { id: orderData.supplierId },
                    data: { currentBalance: { increment: balanceChange } }, // Payable increases on purchase
                });
            }

            // 5. Create Financial Transactions (Simplified for demo)
            // TODO: Ensure Chart of Accounts exists correctly

            return order;
        });
    }

    async update(tenantId: string, id: string, data: any) {
        // Try update sales
        try {
            return await this.prisma.salesOrder.update({
                where: { id, tenantId },
                data,
            });
        } catch {
            // Try purchase
            return this.prisma.purchaseOrder.update({
                where: { id, tenantId },
                data,
            });
        }
    }

    async remove(tenantId: string, id: string) {
        // Check finding it first
        const sales = await this.prisma.salesOrder.findUnique({ where: { id, tenantId } });
        const purchase = await this.prisma.purchaseOrder.findUnique({ where: { id, tenantId } });

        const isSales = !!sales;
        const target = sales || purchase;

        if (!target) throw new NotFoundException('Order not found');

        return this.prisma.$transaction(async (tx) => {
            // Rollback Logic (simplified, assumes strict reverse of creation)
            // Ideally we need to see if it was Return or Normal to know direction
            // For now, assuming standard flow reversal:

            // Delete items
            await tx.orderItem.deleteMany({
                where: isSales ? { salesOrderId: id } : { purchaseOrderId: id },
            });

            // Delete order
            if (isSales) {
                return tx.salesOrder.delete({ where: { id } });
            } else {
                return tx.purchaseOrder.delete({ where: { id } });
            }
        });
    }
}
