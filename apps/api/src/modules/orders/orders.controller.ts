import { Controller, Get, Post, Put, Delete, Body, Param, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('portal/my-orders')
    @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN) // Allow Admin to impersonate or debug if needed
    async findMyOrders(@TenantId() tenantId: string, @CurrentUser() user: any) {
        if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Access denied - Not a portal user');
        }

        const customerId = user.userId;
        return this.ordersService.findAllForCustomer(tenantId, customerId);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findAll(@TenantId() tenantId: string) {
        return this.ordersService.findAll(tenantId);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.ordersService.findOne(tenantId, id);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async create(@TenantId() tenantId: string, @Body() data: any) {
        return this.ordersService.create(tenantId, data);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
        return this.ordersService.update(tenantId, id, data);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async remove(@TenantId() tenantId: string, @Param('id') id: string) {
        return this.ordersService.remove(tenantId, id);
    }
}
