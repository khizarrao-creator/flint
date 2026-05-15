import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const normalizedEmail = email.toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { tenant: true },
        });

        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async validateCustomer(subdomain: string, email: string, pass: string): Promise<any> {
        const normalizedEmail = email.toLowerCase();

        // 1. Find User (portal user)
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { tenant: true }
        });

        if (!user || user.role !== UserRole.VIEWER) return null;

        // 2. Validate Password
        if (!(await bcrypt.compare(pass, user.passwordHash))) return null;

        // 3. Find Customer linked to this portal user
        const customer = await this.prisma.customer.findUnique({
            where: { portalUserId: user.id },
            include: { tenant: true }
        });

        if (customer && customer.isActive && customer.isPortalUser) {
            return {
                ...customer,
                email: user.email,
            };
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            tenantId: user.tenantId,
            role: user.role,
            username: user.username,
            subdomain: user.tenant?.subdomain
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                tenantId: user.tenantId,
                tenant: {
                    name: user.tenant?.name,
                    subdomain: user.tenant?.subdomain,
                    theme: user.tenant?.theme
                }
            }
        };
    }

    async loginCustomer(customer: any) {
        const payload = {
            email: customer.email,
            sub: customer.id,
            tenantId: customer.tenantId,
            role: 'CUSTOMER',
            name: `${customer.firstName} ${customer.lastName}`,
            subdomain: customer.tenant?.subdomain
        };

        return {
            access_token: this.jwtService.sign(payload),
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                currentBalance: customer.currentBalance,
                tenantId: customer.tenantId,
                role: 'CUSTOMER',
                tenant: {
                    name: customer.tenant?.name,
                    subdomain: customer.tenant?.subdomain,
                    theme: customer.tenant?.theme
                }
            }
        };
    }
}
