import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UnitsService } from './units.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('units')
export class UnitsController {
    constructor(private readonly unitsService: UnitsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    findAll(@TenantId() tenantId: string) {
        return this.unitsService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    findOne(
        @TenantId() tenantId: string,
        @Param('id') id: string
    ) {
        return this.unitsService.findOne(tenantId, id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    create(
        @TenantId() tenantId: string,
        @Body() createUnitDto: any
    ) {
        return this.unitsService.create(tenantId, createUnitDto);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() updateUnitDto: any
    ) {
        return this.unitsService.update(tenantId, id, updateUnitDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(
        @TenantId() tenantId: string,
        @Param('id') id: string
    ) {
        return this.unitsService.remove(tenantId, id);
    }
}
