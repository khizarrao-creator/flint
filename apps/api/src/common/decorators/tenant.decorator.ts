import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract tenant ID from authenticated user context
 * 
 * CRITICAL: This extracts tenant ID from the validated JWT token,
 * NOT from client-controlled headers. This is the ONLY safe way
 * to enforce tenant isolation.
 * 
 * The tenant ID comes from:
 * JWT token → JwtStrategy.validate() → req.user.tenantId
 * 
 * Usage:
 * @Get()
 * findAll(@TenantId() tenantId: string) {
 *   // tenantId is cryptographically verified
 *   return this.service.findAll(tenantId);
 * }
 * 
 * @throws Error if user is not authenticated (caught by JWT guard)
 */
export const TenantId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();

        // User context is set by JwtStrategy.validate()
        const user = request.user;

        if (!user || !user.tenantId) {
            // This should never happen if JWT guard is working properly
            throw new Error('Tenant ID not found in authenticated context');
        }

        return user.tenantId;
    },
);
