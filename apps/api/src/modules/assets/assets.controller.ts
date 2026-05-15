import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findAll(@TenantId() tenantId: string) {
        return this.assetsService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.assetsService.findOne(tenantId, id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async create(@TenantId() tenantId: string, @Body() data: any) {
        return this.assetsService.create(tenantId, data);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async update(@Param('id') id: string, @TenantId() tenantId: string, @Body() data: any) {
        return this.assetsService.update(tenantId, id, data);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async delete(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.assetsService.delete(tenantId, id);
    }
}
