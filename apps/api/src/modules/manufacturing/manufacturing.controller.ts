import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ManufacturingService } from './manufacturing.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('manufacturing')
export class ManufacturingController {
    constructor(private readonly manufacturingService: ManufacturingService) { }

    // Formula (BOM) Endpoints
    @Get('formulas')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findAllFormulas(@TenantId() tenantId: string) {
        return this.manufacturingService.findAllFormulas(tenantId);
    }

    @Get('formulas/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findOneFormula(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.manufacturingService.findOneFormula(tenantId, id);
    }

    @Post('formulas')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async createFormula(@TenantId() tenantId: string, @Body() data: any) {
        return this.manufacturingService.createFormula(tenantId, data);
    }

    @Put('formulas/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async updateFormula(@Param('id') id: string, @TenantId() tenantId: string, @Body() data: any) {
        return this.manufacturingService.updateFormula(tenantId, id, data);
    }

    @Delete('formulas/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async deleteFormula(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.manufacturingService.deleteFormula(tenantId, id);
    }

    // Work Order Endpoints
    @Get('work-orders')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findAllWorkOrders(@TenantId() tenantId: string) {
        return this.manufacturingService.findAllWorkOrders(tenantId);
    }

    @Post('work-orders')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async createWorkOrder(@TenantId() tenantId: string, @Body() data: any) {
        return this.manufacturingService.createWorkOrder(tenantId, data);
    }
}
