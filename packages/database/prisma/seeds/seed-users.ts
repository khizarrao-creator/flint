import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed script to create default users for testing the new JWT authentication system
 */
async function seedUsers() {
    const TENANT_ID = process.env.DEFAULT_TENANT_ID || 'tenant-demo-001';

    console.log('🌱 Seeding users for tenant:', TENANT_ID);

    // 1. Ensure Tenant exists
    let tenant = await prisma.tenant.findUnique({ where: { id: TENANT_ID } });
    if (!tenant) {
        console.log('  Creating demo tenant...');
        tenant = await prisma.tenant.create({
            data: {
                id: TENANT_ID,
                name: 'Demo Tenant',
                subdomain: 'demo',
                companyEmail: 'admin@demo.erp.local',
                isActive: true,
            },
        });
    }

    // 2. Create Admin User
    const adminEmail = 'admin@demo.erp.local';
    const adminPassword = 'password123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash: hashedAdminPassword,
            role: UserRole.ADMIN,
            isActive: true,
        },
        create: {
            tenantId: TENANT_ID,
            email: adminEmail,
            username: 'admin',
            passwordHash: hashedAdminPassword,
            role: UserRole.ADMIN,
            isActive: true,
            emailVerified: true,
        },
    });

    console.log(`  ✅ Created Admin User: ${adminEmail} / ${adminPassword}`);

    // 3. Create Manager User
    const managerEmail = 'manager@demo.erp.local';
    const managerPassword = 'password123';
    const hashedManagerPassword = await bcrypt.hash(managerPassword, 10);

    await prisma.user.upsert({
        where: { email: managerEmail },
        update: {
            passwordHash: hashedManagerPassword,
            role: UserRole.MANAGER,
            isActive: true,
        },
        create: {
            tenantId: TENANT_ID,
            email: managerEmail,
            username: 'manager',
            passwordHash: hashedManagerPassword,
            role: UserRole.MANAGER,
            isActive: true,
            emailVerified: true,
        },
    });

    console.log(`  ✅ Created Manager User: ${managerEmail} / ${managerPassword}`);

    // 4. Create Viewer User
    const viewerEmail = 'viewer@demo.erp.local';
    const viewerPassword = 'password123';
    const hashedViewerPassword = await bcrypt.hash(viewerPassword, 10);

    await prisma.user.upsert({
        where: { email: viewerEmail },
        update: {
            passwordHash: hashedViewerPassword,
            role: UserRole.VIEWER,
            isActive: true,
        },
        create: {
            tenantId: TENANT_ID,
            email: viewerEmail,
            username: 'viewer',
            passwordHash: hashedViewerPassword,
            role: UserRole.VIEWER,
            isActive: true,
            emailVerified: true,
        },
    });

    console.log(`  ✅ Created Viewer User: ${viewerEmail} / ${viewerPassword}`);

    console.log('✅ User seeding completed successfully!');
}

seedUsers()
    .catch((e) => {
        console.error('❌ Error seeding users:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
