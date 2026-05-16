import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
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

    @Post('formulas/:id/clone')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async cloneFormula(
        @Param('id') id: string,
        @TenantId() tenantId: string,
        @Body('version') version: string
    ) {
        return this.manufacturingService.cloneFormula(tenantId, id, version);
    }

    @Get('work-orders')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findAllWorkOrders(@TenantId() tenantId: string) {
        return this.manufacturingService.findAllWorkOrders(tenantId);
    }

    @Get('work-orders/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findOneWorkOrder(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.manufacturingService.findOneWorkOrder(tenantId, id);
    }

    @Post('work-orders')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async createWorkOrder(@TenantId() tenantId: string, @Body() data: any) {
        return this.manufacturingService.createWorkOrder(tenantId, data);
    }

    @Put('work-orders/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async updateWorkOrder(@Param('id') id: string, @TenantId() tenantId: string, @Body() data: any) {
        return this.manufacturingService.updateWorkOrder(tenantId, id, data);
    }

    @Delete('work-orders/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async deleteWorkOrder(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.manufacturingService.deleteWorkOrder(tenantId, id);
    }
}
