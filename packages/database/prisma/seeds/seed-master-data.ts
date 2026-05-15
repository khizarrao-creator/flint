import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMasterData() {
    const TENANT_ID = process.env.DEFAULT_TENANT_ID || 'tenant-demo-001';

    console.log('🌱 Seeding master data for tenant:', TENANT_ID);

    // Ensure tenant exists
    let tenant = await prisma.tenant.findUnique({ where: { id: TENANT_ID } });
    if (!tenant) {
        console.log('  Creating tenant...');
        tenant = await prisma.tenant.create({
            data: {
                id: TENANT_ID,
                name: 'Demo Tenant',
                domain: 'demo.erp.local',
                companyEmail: 'admin@demo.erp.local',
                isActive: true,
            },
        });
        console.log('  ✅ Tenant created');
    } else {
        console.log('  ✅ Tenant already exists');
    }

    // Seed Brands
    console.log('  Creating brands...');
    const brands = await Promise.all([
        prisma.brand.upsert({
            where: { id: 'brand-apple' },
            update: {},
            create: {
                id: 'brand-apple',
                tenantId: TENANT_ID,
                name: 'Apple',
                description: 'Premium consumer electronics',
                website: 'https://www.apple.com',
                isActive: true,
            },
        }),
        prisma.brand.upsert({
            where: { id: 'brand-samsung' },
            update: {},
            create: {
                id: 'brand-samsung',
                tenantId: TENANT_ID,
                name: 'Samsung',
                description: 'Global electronics manufacturer',
                website: 'https://www.samsung.com',
                isActive: true,
            },
        }),
        prisma.brand.upsert({
            where: { id: 'brand-dell' },
            update: {},
            create: {
                id: 'brand-dell',
                tenantId: TENANT_ID,
                name: 'Dell',
                description: 'Computer hardware and IT solutions',
                website: 'https://www.dell.com',
                isActive: true,
            },
        }),
        prisma.brand.upsert({
            where: { id: 'brand-generic' },
            update: {},
            create: {
                id: 'brand-generic',
                tenantId: TENANT_ID,
                name: 'Generic',
                description: 'Generic or unbranded products',
                isActive: true,
            },
        }),
    ]);
    console.log(`  ✅ Created ${brands.length} brands`);

    // Seed Units of Measure
    console.log('  Creating units of measure...');
    const units = await Promise.all([
        // Weight units
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-kg' },
            update: {},
            create: {
                id: 'uom-kg',
                tenantId: TENANT_ID,
                name: 'Kilogram',
                code: 'KG',
                symbol: 'kg',
                category: 'Weight',
                baseUnit: true,
                conversion: 1.0,
                isActive: true,
            },
        }),
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-g' },
            update: {},
            create: {
                id: 'uom-g',
                tenantId: TENANT_ID,
                name: 'Gram',
                code: 'G',
                symbol: 'g',
                category: 'Weight',
                baseUnit: false,
                conversion: 0.001,
                isActive: true,
            },
        }),
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-lb' },
            update: {},
            create: {
                id: 'uom-lb',
                tenantId: TENANT_ID,
                name: 'Pound',
                code: 'LB',
                symbol: 'lb',
                category: 'Weight',
                baseUnit: false,
                conversion: 0.453592,
                isActive: true,
            },
        }),
        // Volume units
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-l' },
            update: {},
            create: {
                id: 'uom-l',
                tenantId: TENANT_ID,
                name: 'Liter',
                code: 'L',
                symbol: 'l',
                category: 'Volume',
                baseUnit: true,
                conversion: 1.0,
                isActive: true,
            },
        }),
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-ml' },
            update: {},
            create: {
                id: 'uom-ml',
                tenantId: TENANT_ID,
                name: 'Milliliter',
                code: 'ML',
                symbol: 'ml',
                category: 'Volume',
                baseUnit: false,
                conversion: 0.001,
                isActive: true,
            },
        }),
        // Length units
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-m' },
            update: {},
            create: {
                id: 'uom-m',
                tenantId: TENANT_ID,
                name: 'Meter',
                code: 'M',
                symbol: 'm',
                category: 'Length',
                baseUnit: true,
                conversion: 1.0,
                isActive: true,
            },
        }),
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-cm' },
            update: {},
            create: {
                id: 'uom-cm',
                tenantId: TENANT_ID,
                name: 'Centimeter',
                code: 'CM',
                symbol: 'cm',
                category: 'Length',
                baseUnit: false,
                conversion: 0.01,
                isActive: true,
            },
        }),
        // Quantity units
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-pcs' },
            update: {},
            create: {
                id: 'uom-pcs',
                tenantId: TENANT_ID,
                name: 'Pieces',
                code: 'PCS',
                symbol: 'pcs',
                category: 'Quantity',
                baseUnit: true,
                conversion: 1.0,
                isActive: true,
            },
        }),
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-box' },
            update: {},
            create: {
                id: 'uom-box',
                tenantId: TENANT_ID,
                name: 'Box',
                code: 'BOX',
                symbol: 'box',
                category: 'Quantity',
                baseUnit: false,
                conversion: 1.0,
                isActive: true,
            },
        }),
        prisma.unitOfMeasure.upsert({
            where: { id: 'uom-dozen' },
            update: {},
            create: {
                id: 'uom-dozen',
                tenantId: TENANT_ID,
                name: 'Dozen',
                code: 'DOZ',
                symbol: 'doz',
                category: 'Quantity',
                baseUnit: false,
                conversion: 12.0,
                isActive: true,
            },
        }),
    ]);
    console.log(`  ✅ Created ${units.length} units of measure`);

    // Seed Tax Rates
    console.log('  Creating tax rates...');
    const now = new Date();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);

    const taxRates = await Promise.all([
        prisma.taxRate.upsert({
            where: { id: 'tax-vat-standard' },
            update: {},
            create: {
                id: 'tax-vat-standard',
                tenantId: TENANT_ID,
                name: 'VAT Standard Rate',
                code: 'VAT-STD',
                rate: 0.20, // 20%
                isCompound: false,
                isActive: true,
                effectiveFrom: now,
                effectiveTo: futureDate,
            },
        }),
        prisma.taxRate.upsert({
            where: { id: 'tax-vat-reduced' },
            update: {},
            create: {
                id: 'tax-vat-reduced',
                tenantId: TENANT_ID,
                name: 'VAT Reduced Rate',
                code: 'VAT-RED',
                rate: 0.05, // 5%
                isCompound: false,
                isActive: true,
                effectiveFrom: now,
                effectiveTo: futureDate,
            },
        }),
        prisma.taxRate.upsert({
            where: { id: 'tax-gst' },
            update: {},
            create: {
                id: 'tax-gst',
                tenantId: TENANT_ID,
                name: 'GST',
                code: 'GST',
                rate: 0.18, // 18%
                isCompound: false,
                isActive: true,
                effectiveFrom: now,
                effectiveTo: futureDate,
            },
        }),
        prisma.taxRate.upsert({
            where: { id: 'tax-sales' },
            update: {},
            create: {
                id: 'tax-sales',
                tenantId: TENANT_ID,
                name: 'Sales Tax',
                code: 'SALES-TAX',
                rate: 0.10, // 10%
                isCompound: false,
                isActive: true,
                effectiveFrom: now,
                effectiveTo: futureDate,
            },
        }),
        prisma.taxRate.upsert({
            where: { id: 'tax-exempt' },
            update: {},
            create: {
                id: 'tax-exempt',
                tenantId: TENANT_ID,
                name: 'Tax Exempt',
                code: 'EXEMPT',
                rate: 0.00, // 0%
                isCompound: false,
                isActive: true,
                effectiveFrom: now,
                effectiveTo: futureDate,
            },
        }),
    ]);
    console.log(`  ✅ Created ${taxRates.length} tax rates`);

    console.log('✅ Master data seeding completed successfully!');
}

seedMasterData()
    .catch((e) => {
        console.error('❌ Error seeding master data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
