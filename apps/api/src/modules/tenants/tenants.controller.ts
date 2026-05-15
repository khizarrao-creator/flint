import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('tenants')
@Roles(UserRole.SUPER_ADMIN)
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Post('onboard')
    async onboard(@Body() data: {
        name: string;
        subdomain: string;
        adminEmail: string;
        adminUsername: string;
        adminPass: string;
        isDemo?: boolean;
        expiresAt?: string;
    }) {
        return this.tenantsService.onboard(data);
    }

    @Get()
    async findAll() {
        return this.tenantsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.tenantsService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.tenantsService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.tenantsService.remove(id);
    }
}
