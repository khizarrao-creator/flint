import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER)
    async getStats(@TenantId() tenantId: string) {
        return this.dashboardService.getStats(tenantId);
    }
}
