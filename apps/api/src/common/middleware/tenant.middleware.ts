import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            throw new UnauthorizedException('Missing Tenant Identification');
        }

        // Professional validation: Ensure the tenant exists and is active
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant || !tenant.isActive) {
            throw new UnauthorizedException('Invalid or Inactive Tenant');
        }

        // Attach tenant context to the request for use in controllers
        req['tenantId'] = tenantId;
        next();
    }
}
