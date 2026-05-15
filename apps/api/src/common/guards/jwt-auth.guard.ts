import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT Authentication Guard
 * 
 * Applied globally to all routes, this guard:
 * 1. Checks if route is marked as @Public()
 * 2. If not public, validates JWT token from Authorization header
 * 3. Calls JwtStrategy.validate() to verify user and tenant
 * 4. Attaches user context to request (req.user)
 * 
 * This ensures ALL routes require authentication unless explicitly marked public
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    /**
     * Determines if request can proceed
     * 
     * @param context - Execution context containing request details
     * @returns true if authorized, false/throws otherwise
     */
    canActivate(context: ExecutionContext) {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            // Skip authentication for public routes
            return true;
        }

        // For protected routes, validate JWT via passport strategy
        return super.canActivate(context);
    }

    /**
     * Custom error handling for authentication failures
     * 
     * @param err - Authentication error
     * @param user - User object (if validation succeeded)
     * @param info - Additional error information
     */
    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            // Provide clear error messages for different failure scenarios
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            }
            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token');
            }
            if (info?.message) {
                throw new UnauthorizedException(info.message);
            }

            throw err || new UnauthorizedException('Authentication required');
        }

        return user;
    }
}
