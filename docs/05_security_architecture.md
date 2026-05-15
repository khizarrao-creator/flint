# Security Architecture & Best Practices

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 7: Compliance & Governance (SOC2, GDPR)          │
├─────────────────────────────────────────────────────────┤
│ Layer 6: Application Security (RBAC, CSRF, XSS)        │
├─────────────────────────────────────────────────────────┤
│ Layer 5: API Security (Rate Limiting, OAuth)           │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Data Security (Encryption, RLS)               │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Network Security (WAF, VPC, TLS)              │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Infrastructure Security (IAM, Secrets)        │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Physical Security (AWS Data Centers)          │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Authentication & Authorization

### Authentication (Who are you?)

**Clerk/Auth0 Integration**:
- ✅ **Multi-Factor Authentication (MFA)**: SMS, Authenticator app, or biometric
- ✅ **Social Login**: Google, Microsoft, GitHub OAuth
- ✅ **Email Verification**: Prevent fake accounts
- ✅ **Password Requirements**: Min 12 characters, complexity rules
- ✅ **Session Management**: JWT tokens with 1-hour expiry, refresh tokens (7 days)

**Token Structure (JWT)**:
```json
{
  "sub": "user_abc123",
  "tenant_id": "tenant_xyz789",
  "email": "john@acme.com",
  "role": "manager",
  "permissions": ["sales:read", "sales:write", "inventory:read"],
  "iat": 1675689600,
  "exp": 1675693200
}
```

**Security Measures**:
- ✅ **Token Blacklisting**: Revoked tokens stored in Redis
- ✅ **IP Whitelisting**: Optional for enterprise tenants
- ✅ **Device Fingerprinting**: Detect suspicious logins from new devices
- ✅ **Account Lockout**: 5 failed login attempts → 15-minute lockout

---

### Authorization (What can you do?)

**Role-Based Access Control (RBAC)**:

| Role | Permissions |
|------|-------------|
| **Admin** | `*:*` (all modules, all actions) |
| **Manager** | `sales:*, inventory:*, reports:read` |
| **Sales User** | `sales:read, sales:write, customers:read` |
| **Warehouse User** | `inventory:*, products:read` |
| **Viewer** | `*:read` (read-only) |

**Implementation (NestJS Guard)**:
```typescript
@Controller('sales-orders')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SalesOrdersController {
  @Post()
  @RequirePermission('sales:write')
  async createOrder(@Body() dto: CreateOrderDto) {
    // Only users with 'sales:write' can access this
  }
}
```

**Fine-Grained Permissions**:
- ✅ **Resource-Level**: User can only edit their own quotations
- ✅ **Field-Level**: Viewers can see order totals, but not cost prices
- ✅ **Row-Level Security (DB)**: PostgreSQL RLS ensures tenant isolation

---

## 2. Data Security

### Encryption at Rest

**Database Encryption**:
- ✅ **RDS Encryption**: AES-256 encryption for all database volumes
- ✅ **Automatic Backups**: Encrypted snapshots
- ✅ **Key Management**: AWS KMS (Key Management Service)

**File Storage Encryption**:
- ✅ **S3 Encryption**: Server-side encryption (SSE-S3 or SSE-KMS)
- ✅ **Client-Side Encryption**: Sensitive files (bank statements) encrypted before upload

**Sensitive Field Encryption (Application-Level)**:
- ✅ Credit card numbers (if stored): Vaulted via Stripe
- ✅ Tax IDs, SSNs: Encrypted with `crypto` library before DB storage

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function encryptSensitiveData(plaintext: string, masterKey: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(masterKey), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}
```

---

### Encryption in Transit

- ✅ **TLS 1.3**: All API traffic over HTTPS (Let's Encrypt or AWS ACM certificates)
- ✅ **HSTS Header**: Force HTTPS for all connections
- ✅ **Database Connections**: PostgreSQL SSL mode (`sslmode=require`)
- ✅ **Internal Communication**: Service-to-service traffic over TLS (Istio mTLS in Kubernetes)

---

### Data Masking & Anonymization

**For Non-Production Environments**:
- ✅ **Staging Database**: Real data with PII masked (emails → `user123@example.com`)
- ✅ **Synthetic Data**: Generate fake orders, customers, invoices for testing

**Implementation**:
```sql
-- Anonymize customer emails for staging
UPDATE contacts 
SET email = CONCAT('user', id, '@example.com')
WHERE tenant_id IN (SELECT id FROM tenants WHERE plan = 'staging');
```

---

## 3. Network Security

### Virtual Private Cloud (VPC)

```
┌───────────────────────────────────────────────────────┐
│                    Internet Gateway                   │
└───────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────┐
│              Public Subnet (ALB, NAT)                 │
└───────────────────────────────────────────────────────┘
                         ↓
┌───────────────────────────────────────────────────────┐
│   Private Subnet (ECS Tasks, Lambda, RDS, Redis)     │
│   - No direct internet access                        │
│   - Outbound via NAT Gateway                         │
└───────────────────────────────────────────────────────┘
```

**Security Rules**:
- ✅ **Only ALB is public**: Application servers in private subnet
- ✅ **Database Security Group**: Only accepts connections from app servers
- ✅ **Bastion Host**: If SSH access needed, use AWS Systems Manager Session Manager (no open ports)

---

### Web Application Firewall (WAF)

**AWS WAF Rules**:
1. **SQL Injection Protection**: Block requests with `UNION`, `SELECT`, `DROP` in query params
2. **XSS Protection**: Block `<script>`, `onerror=`, etc.
3. **Rate Limiting**: Max 2,000 requests/5 minutes per IP
4. **Geo-Blocking**: Block requests from high-risk countries (optional)
5. **Bot Protection**: Challenge suspicious user agents

**CloudFlare Alternative** (MVP Stage):
- ✅ Free tier includes DDoS protection and basic WAF

---

## 4. Application Security

### Input Validation & Sanitization

**NestJS Validation Pipes**:
```typescript
import { IsEmail, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @Length(1, 100)
  sku: string;

  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsNumber()
  @Min(0)
  @Max(999999.99)
  salePrice: number;
}
```

**SQL Injection Prevention**:
- ✅ **ORM (TypeORM/Prisma)**: Parameterized queries by default
- ✅ **Never Concatenate SQL**: Use placeholders

**XSS Prevention**:
- ✅ **Frontend**: React automatically escapes JSX content
- ✅ **Backend**: DOMPurify for user-generated HTML (product descriptions)

**CSRF Protection**:
- ✅ **SameSite Cookies**: `SameSite=Strict` for session cookies
- ✅ **CSRF Tokens**: For critical actions (delete account, change billing)

---

### Dependency Security

**Automated Scanning**:
- ✅ **GitHub Dependabot**: Auto-creates PRs for vulnerable dependencies
- ✅ **Snyk**: Scans NPM packages for known vulnerabilities
- ✅ **npm audit**: Run in CI/CD pipeline (fail build if high-severity issues)

**Update Strategy**:
- ✅ **Patch Updates**: Auto-merge (1.2.3 → 1.2.4)
- ✅ **Minor Updates**: Manual review (1.2.3 → 1.3.0)
- ✅ **Major Updates**: Thorough testing (1.2.3 → 2.0.0)

---

## 5. API Security

### Rate Limiting

**Tier-Based Limits**:
| Plan | API Calls/Hour | Burst Limit |
|------|----------------|-------------|
| **Free** | 100 | 10/min |
| **Starter** | 1,000 | 50/min |
| **Professional** | 10,000 | 200/min |
| **Enterprise** | Custom | Custom |

**Implementation (NestJS + Redis)**:
```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('products')
export class ProductsController {
  // Automatically rate-limited based on IP or user ID
}
```

**Response Header**:
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1675693200
Retry-After: 3600
```

---

### API Key Management

**Webhook & Integration Keys**:
- ✅ **Unique Keys**: Each integration gets a separate API key
- ✅ **Scoped Permissions**: Key can be limited to specific endpoints (`read:products`)
- ✅ **Rotation**: Keys expire after 1 year, auto-notify before expiry
- ✅ **Revocation**: Instant invalidation via dashboard

**Key Storage**:
- ✅ **Hashed in DB**: Store `SHA-256(api_key)`, not plaintext
- ✅ **Prefix for Identification**: `pk_live_abc123...` (like Stripe)

---

## 6. Secrets Management

### Environment Variables

**DO NOT**:
- ❌ Hardcode secrets in source code
- ❌ Commit `.env` files to Git

**DO**:
- ✅ Use AWS Secrets Manager or HashiCorp Vault
- ✅ Environment variables injected at runtime (Kubernetes Secrets, ECS Task Definitions)

**Example (Kubernetes Secret)**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: erp-secrets
type: Opaque
data:
  DATABASE_URL: cG9zdGdyZXNxbCovL... # Base64 encoded
  JWT_SECRET: c2VjcmV0a2V5MTIz...
```

**Rotation Strategy**:
- ✅ **Database Passwords**: Rotate every 90 days (AWS Secrets Manager auto-rotation)
- ✅ **API Keys**: Rotate annually or on-demand
- ✅ **JWT Secret**: Never rotate (invalidates all sessions) unless breached

---

## 7. Audit Logging & Monitoring

### What to Log

| Event Type | Data Logged |
|------------|-------------|
| **Authentication** | Login, logout, failed attempts, MFA challenges |
| **Authorization** | Permission denials, role changes |
| **Data Changes** | Create, update, delete (with before/after values) |
| **API Access** | Request method, endpoint, response code, user ID, IP |
| **Security Events** | Suspicious activity, brute-force attempts, token revocations |

**Log Retention**:
- ✅ **Audit Logs**: 7 years (for compliance)
- ✅ **API Access Logs**: 90 days
- ✅ **Application Logs**: 30 days

**Storage**:
- ✅ **Stage 1-2**: CloudWatch Logs (AWS) or integrated logging (Railway)
- ✅ **Stage 3+**: ELK Stack or AWS S3 + Athena (queryable with SQL)

---

### Security Monitoring

**Automated Alerts**:
| Trigger | Action |
|---------|--------|
| **5+ failed logins in 5 min** | Alert admin, lock account |
| **API error rate > 5%** | Alert DevOps team |
| **Unusual data access pattern** | Flag for security review |
| **Privilege escalation attempt** | Immediate notification, auto-revoke |

**Tools**:
- ✅ **Sentry**: Real-time error tracking and alerting
- ✅ **PagerDuty**: On-call rotation for critical security incidents
- ✅ **AWS GuardDuty**: Threat detection (monitors VPC flow logs, DNS logs)

---

## 8. Compliance & Governance

### GDPR (General Data Protection Regulation)

**Requirements**:
1. **Right to Access**: Users can download all their data (JSON export)
2. **Right to Deletion**: Users can request account deletion (7-day grace period)
3. **Data Portability**: Export invoices, orders, customers as CSV
4. **Consent Management**: Track user consent for cookies, marketing emails
5. **Data Residency**: EU customers' data stored in EU-West region

**Implementation**:
```typescript
// API endpoint for GDPR data export
@Get('gdpr/export')
async exportUserData(@CurrentUser() user: User) {
  const data = {
    profile: await this.userService.getProfile(user.id),
    orders: await this.salesService.getUserOrders(user.id),
    payments: await this.paymentService.getUserPayments(user.id),
  };
  return this.exportService.generateZip(data); // Returns ZIP file
}
```

---

### SOC 2 (Service Organization Control)

**Required Controls**:
1. **Access Control**: MFA, RBAC, least privilege
2. **Change Management**: All code changes via pull requests, reviewed by 2+ engineers
3. **Data Encryption**: At rest and in transit
4. **Incident Response**: Documented process, drill every 6 months
5. **Vendor Management**: Audit third-party services (AWS, Clerk, Stripe)

**Timeline**:
- Year 1: Implement controls
- Year 2: SOC 2 Type 1 audit (point-in-time)
- Year 3: SOC 2 Type 2 audit (effectiveness over 6+ months)

---

### Data Retention & Deletion

**Automated Policies**:
| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| **Invoices** | 7 years (tax law) | Soft delete (flagged, not shown in UI) |
| **Audit Logs** | 7 years | Archived to S3 Glacier |
| **User Sessions** | 7 days (inactive) | Auto-expired by Redis TTL |
| **Deleted Accounts** | 30 days (backup) | Hard delete from all systems |

---

## 9. Incident Response Plan

### Phases

1. **Detection**: Automated alerts (Sentry, GuardDuty) or user report
2. **Containment**: Isolate affected systems, revoke compromised credentials
3. **Eradication**: Patch vulnerability, remove malicious code
4. **Recovery**: Restore from backups if needed, verify integrity
5. **Post-Incident**: Document root cause, update security measures

**Breach Notification**:
- ✅ **Internal**: Notify CEO, CTO, Legal within 1 hour
- ✅ **Customers**: If PII is compromised, notify within 72 hours (GDPR requirement)
- ✅ **Public**: Transparent blog post if breach is widespread

---

## 10. Security Checklist (Pre-Launch)

### Backend
- [ ] All API endpoints require authentication
- [ ] RBAC implemented for all routes
- [ ] SQL injection protection (ORM)
- [ ] XSS protection (input sanitization)
- [ ] CSRF tokens for critical actions
- [ ] Rate limiting enabled
- [ ] Environment variables secured (Secrets Manager)
- [ ] Database backups encrypted
- [ ] TLS 1.3 for all connections

### Frontend
- [ ] HTTPS enforced (HSTS header)
- [ ] No secrets in JavaScript code
- [ ] CSP (Content Security Policy) header set
- [ ] SameSite cookies for sessions
- [ ] Input validation on client and server

### Infrastructure
- [ ] Database in private subnet
- [ ] WAF enabled (SQL injection, XSS rules)
- [ ] VPC flow logs enabled
- [ ] IAM roles follow least privilege
- [ ] MFA for AWS root account

### Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner (GDPR)
- [ ] Data export/deletion endpoints (GDPR)
- [ ] Audit logging enabled

---

## Common Security Vulnerabilities (OWASP Top 10)

| Vulnerability | Risk | Mitigation |
|--------------|------|------------|
| **Broken Access Control** | High | RBAC, RLS, permission guards |
| **Cryptographic Failures** | High | TLS, encrypted DB, KMS |
| **Injection** | High | ORM, parameterized queries |
| **Insecure Design** | Medium | Threat modeling, security reviews |
| **Security Misconfiguration** | Medium | Automated security scans, hardened defaults |
| **Vulnerable Components** | High | Dependabot, Snyk, npm audit |
| **Identification Failures** | High | MFA, strong passwords, session management |
| **Integrity Failures** | Medium | Code signing, SRI for CDN assets |
| **Logging Failures** | Medium | Comprehensive audit logs |
| **SSRF** | Medium | Validate URLs, restrict outbound traffic |

---

## Security Cost Breakdown

| Service | Monthly Cost | Purpose |
|---------|--------------|---------|
| **AWS WAF** | $15-50 | DDoS protection, injection prevention |
| **GuardDuty** | $10-30 | Threat detection |
| **Secrets Manager** | $5 | Secure credential storage |
| **CloudTrail** | $5 | AWS API audit logging |
| **Snyk** | $0-50 | Dependency scanning |
| **PagerDuty** | $25/user | Incident management |
| **Total** | **$60-160** | (Scales with usage) |

**Free Tiers (MVP)**:
- ✅ GitHub Dependabot (free)
- ✅ Cloudflare WAF (free tier)
- ✅ Let's Encrypt TLS (free)

---

## Summary: Security is Not Optional

- ✅ **Defense in Depth**: Multiple layers of security
- ✅ **Shift Left**: Security from Day 1, not as an afterthought
- ✅ **Automate**: Security scanning in CI/CD
- ✅ **Educate**: Train developers on secure coding practices
- ✅ **Audit**: Regular penetration testing (annual after product-market fit)
