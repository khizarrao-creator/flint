import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinancesService {
    constructor(private prisma: PrismaService) { }

    async initializeTenantAccounts(tenantId: string, tx?: Prisma.TransactionClient) {
        const prisma = tx || this.prisma;

        const defaultAccounts = [
            { name: 'Cash on Hand', type: 'ASSET', code: '1001' },
            { name: 'Accounts Receivable', type: 'ASSET', code: '1101' },
            { name: 'Sales Revenue', type: 'REVENUE', code: '4001' },
            { name: 'Cost of Goods Sold', type: 'EXPENSE', code: '5001' },
        ];

        for (const acc of defaultAccounts) {
            await prisma.account.upsert({
                where: {
                    tenantId_code: {
                        tenantId,
                        code: acc.code
                    }
                },
                update: {},
                create: {
                    ...acc,
                    tenantId,
                    currentBalance: 0,
                    openingBalance: 0,
                    currency: 'USD'
                }
            });
        }
    }

    async getAccounts(tenantId: string) {
        return this.prisma.account.findMany({
            where: { tenantId },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });
    }

    async getTransactions(tenantId: string, accountId?: string) {
        return this.prisma.transaction.findMany({
            where: {
                tenantId,
                ...(accountId && { accountId })
            },
            orderBy: { transactionDate: 'desc' },
            take: 50
        });
    }

    async createTransaction(tenantId: string, data: {
        accountId: string;
        amount: number;
        type: 'CREDIT' | 'DEBIT';
        description: string;
        referenceId?: string;
        referenceType?: string;
        referenceNumber?: string;
    }) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the transaction record
            const transaction = await tx.transaction.create({
                data: {
                    ...data,
                    amount: data.amount,
                    baseAmount: data.amount,
                    tenantId,
                }
            });

            // 2. Update the account balance
            const account = await tx.account.findUnique({ where: { id: data.accountId } });
            if (!account) throw new NotFoundException('Account not found');

            let balanceChange = new Prisma.Decimal(data.amount);
            const isAssetOrExpense = ['ASSET', 'EXPENSE'].includes(account.type.toUpperCase());

            if (isAssetOrExpense) {
                if (data.type === 'CREDIT') balanceChange = balanceChange.negated();
            } else {
                if (data.type === 'DEBIT') balanceChange = balanceChange.negated();
            }

            await tx.account.update({
                where: { id: data.accountId },
                data: {
                    currentBalance: {
                        increment: balanceChange
                    }
                }
            });

            return transaction;
        });
    }

    async recordPayment(tenantId: string, data: {
        customerId: string;
        amount: number;
        referenceNumber?: string;
    }) {
        return this.prisma.$transaction(async (tx) => {
            const cashAcc = await tx.account.findUnique({
                where: { tenantId_code: { tenantId, code: '1001' } }
            });
            const receivableAcc = await tx.account.findUnique({
                where: { tenantId_code: { tenantId, code: '1101' } }
            });

            if (!cashAcc || !receivableAcc) throw new NotFoundException('Financial accounts not initialized');

            // 1. Debit Cash (Increase Asset)
            await tx.transaction.create({
                data: {
                    tenantId,
                    accountId: cashAcc.id,
                    amount: data.amount,
                    baseAmount: data.amount,
                    type: 'DEBIT',
                    description: `Payment from Customer`,
                    referenceId: data.referenceNumber // Using ref number as id for traceability
                }
            });
            await tx.account.update({
                where: { id: cashAcc.id },
                data: { currentBalance: { increment: data.amount } }
            });

            // 2. Credit Receivable (Decrease Asset)
            await tx.transaction.create({
                data: {
                    tenantId,
                    accountId: receivableAcc.id,
                    amount: data.amount,
                    baseAmount: data.amount,
                    type: 'CREDIT',
                    description: `Payment Reconciliation`,
                    referenceId: data.referenceNumber
                }
            });
            await tx.account.update({
                where: { id: receivableAcc.id },
                data: { currentBalance: { decrement: data.amount } }
            });

            // 3. Update Customer Ledger
            return tx.customer.update({
                where: { id: data.customerId },
                data: {
                    currentBalance: {
                        decrement: data.amount
                    }
                }
            });
        });
    }
    async getFinancialStatements(tenantId: string) {
        const accounts = await this.prisma.account.findMany({
            where: { tenantId },
            orderBy: { code: 'asc' }
        });

        const assets = accounts.filter(a => a.type.toUpperCase() === 'ASSET');
        const liabilities = accounts.filter(a => a.type.toUpperCase() === 'LIABILITY');
        const equity = accounts.filter(a => a.type.toUpperCase() === 'EQUITY');
        const revenue = accounts.filter(a => a.type.toUpperCase() === 'REVENUE');
        const expenses = accounts.filter(a => a.type.toUpperCase() === 'EXPENSE');

        const sum = (accs: any[]) => accs.reduce((sum, a) => sum + Number(a.currentBalance), 0);

        const totalAssets = sum(assets);
        const totalLiabilities = sum(liabilities);
        const totalEquity = sum(equity);
        const totalRevenue = sum(revenue);
        const totalExpenses = sum(expenses);
        const netIncome = totalRevenue - totalExpenses;

        return {
            balanceSheet: {
                assets,
                liabilities,
                equity,
                totals: {
                    assets: totalAssets,
                    liabilities: totalLiabilities,
                    equity: totalEquity
                }
            },
            incomeStatement: {
                revenue,
                expenses,
                totals: {
                    revenue: totalRevenue,
                    expenses: totalExpenses,
                    netIncome
                }
            }
        };
    }
}
