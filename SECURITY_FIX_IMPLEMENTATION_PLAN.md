# SECURITY FIX IMPLEMENTATION PLAN

**Priority**: 🔴 CRITICAL - PRODUCTION BLOCKER  
**Focus**: Correctness over speed

---

## OVERVIEW

This plan addresses the critical security vulnerabilities identified in the system audit. The work is organized into logical phases, each building on the previous. **Quality and correctness are the only metrics that matter.**

---

## PHASE 1: CORE AUTHENTICATION ✅ 70% COMPLETE

### ✅ Completed Tasks

1. **JWT Strategy** - Validates tokens and verifies user/tenant
2. **JWT Auth Guard** - Global authentication enforcement
3. **Decorators** - @Public(), @TenantId(), @CurrentUser()
4. **Auth Module** - Registered strategy and configured JWT
5. **Auth Controller** - Marked login endpoints as public
6. **App Module** - Removed flawed middleware, added global guard

### ⏳ Remaining Tasks

#### Task 1.1: Update All Controllers to Use New Decorators

**Pattern to Replace**:
```typescript
// OLD (insecure):
@Get()
findAll(@Headers('x-tenant-id') tenantId: string) {
  return this.service.findAll(tenantId);
}

// NEW (secure):
@Get()
findAll(@TenantId() tenantId: string) {
  return this.service.findAll(tenantId);
}
```

**Controllers to Update** (11 total):
1. `apps/api/src/modules/products/products.controller.ts`
2. `apps/api/src/modules/brands/brands.controller.ts`
3. `apps/api/src/modules/units/units.controller.ts`
4. `apps/api/src/modules/tax-rates/tax-rates.controller.ts`
5. `apps/api/src/modules/categories/categories.controller.ts`
6. `apps/api/src/modules/customers/customers.controller.ts`
7. `apps/api/src/modules/orders/orders.controller.ts`
8. `apps/api/src/modules/manufacturing/manufacturing.controller.ts`
9. `apps/api/src/modules/assets/assets.controller.ts`
10. `apps/api/src/modules/finances/finances.controller.ts`
11. `apps/api/src/modules/dashboard/dashboard.controller.ts`

**Process for Each Controller**:
1. Import decorators: `import { TenantId } from '../../common/decorators/tenant.decorator';`
2. Replace ALL instances of `@Headers('x-tenant-id')` with `@TenantId()`
3. Optionally add `@CurrentUser()` where audit logging is needed
4. Verify TypeScript compilation passes

#### Task 1.2: Create User Seed Data

**File**: `packages/database/prisma/seeds/seed-users.ts`

Must create at least one admin user for testing:
- Email and hashed password (using bcrypt)
- Assigned to a tenant
- Role: ADMIN
- IsActive: true

#### Task 1.3: Test Authentication Flow

**Test Checklist**:
- [ ] Login endpoint returns JWT token
- [ ] Protected endpoints reject requests without token
- [ ] Protected endpoints accept requests with valid token
- [ ] Token expiration works (after 24 hours)
- [ ] Invalid tokens are rejected

---

## PHASE 2: ROLE-BASED ACCESS CONTROL

### Task 2.1: Create Roles Infrastructure

#### Roles Guard
**File**: `apps/api/src/common/guards/roles.guard.ts`

Guard that checks if authenticated user has required role(s).

#### Roles Decorator
**File**: `apps/api/src/common/decorators/roles.decorator.ts`

Decorator to specify required roles for endpoints.

**Usage**:
```typescript
@Delete(':id')
@Roles(UserRole.ADMIN)  // Only admins can delete
remove(@TenantId() tenantId: string, @Param('id') id: string) {
  return this.service.remove(tenantId, id);
}
```

#### Register Roles Guard
**File**: `apps/api/src/app.module.ts`

Add RolesGuard as second global guard.

### Task 2.2: Apply Role Restrictions

Define permission matrix:

| Resource | View | Create | Edit | Delete |
|----------|------|--------|------|--------|
| Products | All | Manager+ | Manager+ | Admin |
| Categories | All | Manager+ | Manager+ | Admin |
| Brands | All | Manager+ | Manager+ | Admin |
| Customers | All | Manager+ | Manager+ | Admin |
| Orders | All | Manager+ | Manager+ | Admin |
| Finances | All | Admin | Admin | Admin |
| Users | Admin | Admin | Admin | Admin |
| Settings | Admin | Admin | Admin | Admin |

Apply `@Roles()` decorator to each endpoint according to matrix.

---

## PHASE 3: FRONTEND INTEGRATION

### Task 3.1: Create Auth Context

**File**: `apps/web/contexts/AuthContext.tsx`

React Context that:
- Manages authentication state (user, token)
- Provides login/logout functions
- Stores token in localStorage or httpOnly cookie
- Checks authentication status on app load

### Task 3.2: Create Login Page

**File**: `apps/web/app/login/page.tsx`

Form with:
- Email input
- Password input
- Submit button
- Error display
- Calls `POST /api/auth/login`
- Stores returned JWT token
- Redirects to dashboard on success

### Task 3.3: Create API Client

**File**: `apps/web/lib/api-client.ts`

Centralized API client that:
- Automatically adds `Authorization: Bearer <token>` header
- Handles 401 responses (redirect to login)
- Handles token refresh (if implemented)
- Provides type-safe methods (get, post, put, delete)

**Example**:
```typescript
export class ApiClient {
  private getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response.json();
  }

  get(endpoint: string) { return this.request(endpoint); }
  post(endpoint: string, data: any) { 
    return this.request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    });
  }
  // ... put, delete
}
```

### Task 3.4: Refactor All Components

**Pattern**:
```typescript
// OLD:
const tenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID;
fetch(`${API_URL}/products`, {
  headers: { 'x-tenant-id': tenantId }
});

// NEW:
import { apiClient } from '@/lib/api-client';
const products = await apiClient.get('/products');
```

**Files to Update** (40+):
- All page components (`app/**/page.tsx`)
- All modal components (`components/**/*)
- All form components

### Task 3.5: Add Route Protection

**File**: `apps/web/middleware.ts` (or route guards)

Redirect unauthenticated users to login page.

---

## PHASE 4: AUDIT & SECURITY HARDENING

### Task 4.1: Implement Audit Logging

**File**: `apps/api/src/common/interceptors/audit.interceptor.ts`

Interceptor that logs:
- Who performed the action (userId)
- What action (HTTP method + endpoint)
- When (timestamp)
- For which tenant (tenantId)
- From where (IP address)
- What changed (request body for write operations)

Stores logs in `AuditLog` table.

### Task 4.2: Add Rate Limiting

**Package**: `@nestjs/throttler`

Protect against brute force attacks:
- Login endpoint: 5 attempts per minute
- All other endpoints: 100 requests per minute

### Task 4.3: Security Headers

Configure:
- CORS (restrict allowed origins in production)
- CSRF protection
- Helmet (security headers)
- Request size limits

### Task 4.4: Write Security Tests

**File**: `apps/api/test/security/auth.e2e-spec.ts`

Test scenarios:
- Unauthenticated requests are rejected
- Invalid JWT is rejected
- Expired JWT is rejected
- Cross-tenant access is prevented
- Role restrictions work correctly
- Audit logs are created

### Task 4.5: Penetration Testing

Manual security testing:
- Try to access other tenant's data
- Try SQL injection
- Try XSS attacks
- Try privilege escalation
- Try session hijacking

Document findings and fix all issues.

---

## ROLLOUT STRATEGY

### Pre-Deployment Checklist
- [ ] All phases complete
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Security tests passed
- [ ] Penetration tests passed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Rollback plan documented

### Staging Deployment
1. Deploy to staging environment
2. Run full test suite
3. Manual QA testing
4. Load testing
5. Security audit
6. Fix any issues found

### Production Deployment
1. Schedule maintenance window
2. Backup database
3. Deploy backend changes
4. Deploy frontend changes
5. Run smoke tests
6. Monitor error logs for 24 hours
7. Verify no security issues

### Post-Deployment Monitoring
- Monitor authentication errors
- Check audit logs for suspicious activity
- Performance metrics
- User feedback
- Error rates

---

## ROLLBACK PLAN

If critical issues arise after deployment:

### Immediate Actions
1. Assess severity and impact
2. Decide: fix forward or rollback
3. Communicate with stakeholders

### Rollback Steps
1. Revert frontend deployment
2. Revert backend deployment
3. Restore database if schema changed
4. Verify system is functional
5. Investigate root cause
6. Plan fix and re-deploy

### Prevention
- Always test in staging first
- Have monitoring in place
- Keep rollback scripts ready
- Document rollback procedures

---

## SUCCESS CRITERIA

### Phase 1 Complete When:
- [ ] All controllers use @TenantId() decorator
- [ ] Users can successfully login
- [ ] JWT tokens are validated on every request
- [ ] Tenant ID comes from JWT, not headers
- [ ] No TypeScript errors
- [ ] Basic authentication tests pass

### Phase 2 Complete When:
- [ ] All endpoints have role restrictions
- [ ] ADMIN, MANAGER, VIEWER roles enforced
- [ ] Unauthorized access attempts are blocked
- [ ] Role tests pass

### Phase 3 Complete When:
- [ ] Frontend login page works
- [ ] Auth context manages state correctly
- [ ] All API calls use API client
- [ ] Unauthenticated users redirected to login
- [ ] No errors in browser console

### Phase 4 Complete When:
- [ ] All write operations create audit logs
- [ ] Rate limiting prevents brute force
- [ ] Security headers configured
- [ ] All security tests pass
- [ ] Penetration testing complete with no critical findings

### Production Ready When:
- [ ] ALL phases complete
- [ ] Zero cross-tenant data leakage
- [ ] Zero authentication bypasses
- [ ] Comprehensive audit trail
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Documentation complete

---

## NOTES

### Why No Timelines?

**Quality over speed.** Security is not negotiable. Taking time to:
- Understand the problem deeply
- Design the correct solution
- Implement it properly
- Test thoroughly
- Document completely

...is infinitely better than rushing and creating more security holes.

### Philosophy

**Correctness first.**
- Code that works correctly is better than code that works fast
- Security holes are never acceptable
- Technical debt in auth is catastrophic
- Better to take 2x time and get it right than rush and fail

### When Complete

You will have:
- Production-grade authentication
- Cryptographically secure tenant isolation
- Full audit trail
- Role-based access control
- Protected against common attacks
- System ready for compliance (SOC2, GDPR, etc.)

This is the **foundation** everything else builds on. Get it right.

---

**Document Status**: Updated - Timelines Removed  
**Last Updated**: 2026-02-09  
**Focus**: Quality, Correctness, Security
