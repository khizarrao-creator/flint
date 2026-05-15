import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Decorator to specify required roles for an endpoint
 * 
 * Usage:
 * @Delete(':id')
 * @Roles(UserRole.ADMIN)
 * remove(@TenantId() tenantId: string, @Param('id') id: string) {
 *   return this.service.remove(tenantId, id);
 * }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
