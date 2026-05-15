import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract full user context from authenticated request
 * 
 * Returns the complete user object attached to the request by JwtStrategy.validate()
 * 
 * User object contains:
 * - userId: string
 * - email: string
 * - username: string
 * - tenantId: string
 * - role: UserRole
 * - tenant: { name, subdomain }
 * 
 * Usage:
 * @Post()
 * create(@CurrentUser() user: any, @Body() createDto: any) {
 *   // Access user info for audit logging
 *   console.log(`User ${user.email} created record`);
 *   return this.service.create(user.tenantId, createDto, user.userId);
 * }
 * 
 * @throws Error if user is not authenticated
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        if (!request.user) {
            // This should never happen if JWT guard is working properly
            throw new Error('User not found in authenticated context');
        }

        return request.user;
    },
);
