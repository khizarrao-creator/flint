import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('finances')
export class FinancesController {
    constructor(private readonly financesService: FinancesService) { }

    @Get('accounts')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async getAccounts(@TenantId() tenantId: string) {
        return this.financesService.getAccounts(tenantId);
    }

    @Get('transactions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async getTransactions(
        @TenantId() tenantId: string,
        @Query('accountId') accountId?: string
    ) {
        return this.financesService.getTransactions(tenantId, accountId);
    }

    @Get('statements')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async getStatements(@TenantId() tenantId: string) {
        return this.financesService.getFinancialStatements(tenantId);
    }

    @Post('init')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async initAccounts(@TenantId() tenantId: string) {
        await this.financesService.initializeTenantAccounts(tenantId);
        return { message: 'Accounts initialized' };
    }

    @Post('transaction')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async createTransaction(@TenantId() tenantId: string, @Body() data: any) {
        return this.financesService.createTransaction(tenantId, data);
    }

    @Post('record-payment')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async recordPayment(@TenantId() tenantId: string, @Body() data: any) {
        return this.financesService.recordPayment(tenantId, data);
    }
}
