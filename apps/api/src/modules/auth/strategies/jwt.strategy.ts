import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * JWT Strategy for validating access tokens
 * 
 * This strategy:
 * 1. Extracts JWT from Authorization header
 * 2. Validates the token signature
 * 3. Verifies user and tenant still exist and are active
 * 4. Attaches user context to request for use in guards/controllers
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'super-secret-flint-key-2026',
        });
    }

    /**
     * Validates the JWT payload and attaches user context to request
     * 
     * @param payload - Decoded JWT payload containing user information
     * @returns User context object that becomes `req.user`
     * @throws UnauthorizedException if user/tenant is invalid or inactive
     */
    async validate(payload: any) {
        // Payload structure from AuthService.login():
        // { email, sub: userId, tenantId, role, username, subdomain }

        // Verify user still exists and is active
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                tenant: true
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        // Verify tenant exists and is active
        if (!user.tenant) {
            throw new UnauthorizedException('Tenant not found');
        }

        if (!user.tenant.isActive) {
            throw new UnauthorizedException('Tenant is inactive');
        }

        if (user.tenant.isSuspended) {
            throw new UnauthorizedException('Tenant account is suspended');
        }

        // Return user context that will be attached to request as req.user
        // This is the SINGLE SOURCE OF TRUTH for tenant ID and user identity
        return {
            userId: user.id,
            email: user.email,
            username: user.username,
            tenantId: user.tenantId,
            role: user.role,
            tenant: {
                name: user.tenant.name,
                subdomain: user.tenant.subdomain,
            },
        };
    }
}
