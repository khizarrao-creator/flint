import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    findAll(@TenantId() tenantId: string) {
        return this.brandsService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    findOne(
        @TenantId() tenantId: string,
        @Param('id') id: string
    ) {
        return this.brandsService.findOne(tenantId, id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    create(
        @TenantId() tenantId: string,
        @Body() createBrandDto: any
    ) {
        return this.brandsService.create(tenantId, createBrandDto);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() updateBrandDto: any
    ) {
        return this.brandsService.update(tenantId, id, updateBrandDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    remove(
        @TenantId() tenantId: string,
        @Param('id') id: string
    ) {
        return this.brandsService.remove(tenantId, id);
    }
}
