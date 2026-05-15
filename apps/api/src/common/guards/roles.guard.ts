import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard
 * 
 * This guard checks if the authenticated user has the required roles
 * to access a specific endpoint.
 * 
 * It must be used in conjunction with the JwtAuthGuard which ensures 
 * that `req.user` is populated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    /**
     * Determines if the current user has access based on roles
     * 
     * @param context - Execution context
     * @returns true if user has required role, throws otherwise
     */
    canActivate(context: ExecutionContext): boolean {
        // 1. Get required roles from metadata
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 2. If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // 3. Get user from request (set by JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            // This should not happen if JwtAuthGuard is global and executed first
            throw new ForbiddenException('User context not found');
        }

        // 4. Check if user has at least one of the required roles
        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException(`Access denied: Requires one of roles [${requiredRoles.join(', ')}]`);
        }

        return true;
    }
}
