import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TaxRatesService } from './tax-rates.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('tax-rates')
export class TaxRatesController {
    constructor(private readonly taxRatesService: TaxRatesService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    findAll(@TenantId() tenantId: string) {
        return this.taxRatesService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    findOne(
        @TenantId() tenantId: string,
        @Param('id') id: string
    ) {
        return this.taxRatesService.findOne(tenantId, id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    create(
        @TenantId() tenantId: string,
        @Body() createTaxRateDto: any
    ) {
        return this.taxRatesService.create(tenantId, createTaxRateDto);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() updateTaxRateDto: any
    ) {
        return this.taxRatesService.update(tenantId, id, updateTaxRateDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(
        @TenantId() tenantId: string,
        @Param('id') id: string
    ) {
        return this.taxRatesService.remove(tenantId, id);
    }
}
