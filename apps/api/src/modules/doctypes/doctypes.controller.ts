import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DocTypesService } from './doctypes.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('doctypes')
export class DocTypesController {
    constructor(private readonly docTypesService: DocTypesService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findAll(@TenantId() tenantId: string) {
        return this.docTypesService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.docTypesService.findOne(tenantId, id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async create(@TenantId() tenantId: string, @Body() data: any) {
        return this.docTypesService.create(tenantId, data);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
        return this.docTypesService.update(tenantId, id, data);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async remove(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.docTypesService.remove(tenantId, id);
    }
}
