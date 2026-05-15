import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findAll(@TenantId() tenantId: string) {
        return this.productsService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.productsService.findOne(tenantId, id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async create(@TenantId() tenantId: string, @Body() data: any) {
        return this.productsService.create(tenantId, data);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
        return this.productsService.update(tenantId, id, data);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async remove(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.productsService.remove(tenantId, id);
    }
}
