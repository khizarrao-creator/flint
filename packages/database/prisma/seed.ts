
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Flint Database Seeding...');

    // 1. Create a Master Tenant
    const flintHq = await prisma.tenant.upsert({
        where: { subdomain: 'hq' },
        update: {},
        create: {
            name: 'Flint Headquarters',
            subdomain: 'hq',
            companyEmail: 'admin@flint.com',
            isActive: true,
            currency: 'USD',
        },
    });

    console.log('✅ Created Tenant:', flintHq.name);

    // 1.1 Initiate Financial Accounts
    const defaultAccounts = [
        { name: 'Cash on Hand', type: 'ASSET', code: '1001' },
        { name: 'Accounts Receivable', type: 'ASSET', code: '1101' },
        { name: 'Inventory Asset', type: 'ASSET', code: '1201' },
        { name: 'Accounts Payable', type: 'LIABILITY', code: '2001' },
        { name: 'Sales Revenue', type: 'REVENUE', code: '4001' },
        { name: 'Cost of Goods Sold', type: 'EXPENSE', code: '5001' },
    ];

    for (const acc of defaultAccounts) {
        await prisma.account.upsert({
            where: {
                tenantId_code: {
                    tenantId: flintHq.id,
                    code: acc.code
                }
            },
            update: {
                type: acc.type,
                name: acc.name
            },
            create: {
                ...acc,
                tenantId: flintHq.id,
                currentBalance: 0,
                openingBalance: 0,
                currency: 'USD'
            }
        });
    }
    console.log('💰 Initialized Financial Accounts');

    // 2. Create Super User
    const hashedPassword = await bcrypt.hash('unlock', 10);
    const superUserEmail = 'khizarraoworks@gmail.com';
    const superUser = await prisma.user.upsert({
        where: { email: superUserEmail },
        update: {
            passwordHash: hashedPassword,
            role: UserRole.SUPER_ADMIN,
            username: 'Khizar',
        },
        create: {
            tenantId: flintHq.id,
            email: superUserEmail,
            username: 'Khizar',
            passwordHash: hashedPassword,
            role: UserRole.SUPER_ADMIN,
            emailVerified: true,
        },
    });

    console.log('👑 Created Super User:', superUser.username);

    // 3. Create Categories
    const electronics = await prisma.category.upsert({
        where: { tenantId_code: { tenantId: flintHq.id, code: 'CAT-ELEC' } },
        update: {},
        create: {
            tenantId: flintHq.id,
            name: 'Electronics',
            description: 'High-end electronic devices and parts',
            code: 'CAT-ELEC'
        },
    });

    const office = await prisma.category.upsert({
        where: { tenantId_code: { tenantId: flintHq.id, code: 'CAT-OFF' } },
        update: {},
        create: {
            tenantId: flintHq.id,
            name: 'Office Supplies',
            description: 'Stationery and furniture',
            code: 'CAT-OFF'
        },
    });

    // 3.1 Create Main Warehouse
    const warehouse = await prisma.warehouse.upsert({
        where: { tenantId_code: { tenantId: flintHq.id, code: 'WH-MAIN' } },
        update: {},
        create: {
            tenantId: flintHq.id,
            name: 'Main Warehouse',
            code: 'WH-MAIN',
        }
    });
    console.log('🏭 Created Warehouse:', warehouse.name);

    // 4. Create Products and Stock
    const macbook = await prisma.product.upsert({
        where: { tenantId_sku: { tenantId: flintHq.id, sku: 'FL-MAC-001' } },
        update: {
            totalQuantity: 25,
            availableQuantity: 25
        },
        create: {
            tenantId: flintHq.id,
            categoryId: electronics.id,
            sku: 'FL-MAC-001',
            code: 'FL-MAC-001',
            name: 'MacBook Pro 16" - M3 Max',
            description: 'Ultimate workstation for designers and developers',
            basePrice: 3499.0,
            costPrice: 2800.0,
            salePrice: 3499.0,
            totalQuantity: 25,
            availableQuantity: 25,
            reorderPoint: 5,
        },
    });

    const existingStockItemMac = await prisma.stockItem.findFirst({
        where: {
            tenantId: flintHq.id,
            productId: macbook.id,
            warehouseId: warehouse.id,
            batchNumber: null,
            serialNumber: null
        }
    });

    if (!existingStockItemMac) {
        await prisma.stockItem.create({
            data: {
                tenantId: flintHq.id,
                productId: macbook.id,
                warehouseId: warehouse.id,
                quantity: 25,
                availableQuantity: 25,
                batchNumber: null,
                serialNumber: null
            }
        });
    } else {
        await prisma.stockItem.update({
            where: { id: existingStockItemMac.id },
            data: {
                quantity: 25,
                availableQuantity: 25
            }
        });
    }

    const dell = await prisma.product.upsert({
        where: { tenantId_sku: { tenantId: flintHq.id, sku: 'FL-XPS-002' } },
        update: {
            totalQuantity: 40,
            availableQuantity: 40
        },
        create: {
            tenantId: flintHq.id,
            categoryId: electronics.id,
            sku: 'FL-XPS-002',
            code: 'FL-XPS-002',
            name: 'Dell XPS 15',
            description: 'The Windows powerhouse.',
            basePrice: 2199.0,
            costPrice: 1700.0,
            salePrice: 2199.0,
            totalQuantity: 40,
            availableQuantity: 40,
            reorderPoint: 10,
        },
    });

    const existingStockItemDell = await prisma.stockItem.findFirst({
        where: {
            tenantId: flintHq.id,
            productId: dell.id,
            warehouseId: warehouse.id,
            batchNumber: null,
            serialNumber: null
        }
    });

    if (!existingStockItemDell) {
        await prisma.stockItem.create({
            data: {
                tenantId: flintHq.id,
                productId: dell.id,
                warehouseId: warehouse.id,
                quantity: 40,
                availableQuantity: 40,
                batchNumber: null,
                serialNumber: null
            }
        });
    } else {
        await prisma.stockItem.update({
            where: { id: existingStockItemDell.id },
            data: {
                quantity: 40,
                availableQuantity: 40
            }
        });
    }

    // 5. Create Customers
    await prisma.customer.upsert({
        where: { tenantId_code: { tenantId: flintHq.id, code: 'CUST-001' } },
        update: {
            displayName: 'Wayne Enterprises',
            companyName: 'Wayne Enterprises'
        },
        create: {
            tenantId: flintHq.id,
            firstName: 'Bruce',
            lastName: 'Wayne',
            displayName: 'Wayne Enterprises',
            companyName: 'Wayne Enterprises',
            code: 'CUST-001',
            contactInfo: { phone: '+1-555-9999', email: 'bruce@waynecorp.com' },
            primaryContact: { name: 'Bruce Wayne', email: 'bruce@waynecorp.com' },
            currentBalance: 15400.0,
        },
    });

    // 6. Seed DocTypes & DocSequences
    const docTypeData = [
        { name: "Sales Order", code: "SO", nextNum: 1, prefix: "SO-" },
        { name: "Purchase Order", code: "PO", nextNum: 1, prefix: "PO-" },
        { name: "Invoice", code: "INV", nextNum: 1000, prefix: "INV-" },
    ];

    for (const dt of docTypeData) {
        const docType = await prisma.docType.upsert({
            where: { tenantId_code: { tenantId: flintHq.id, code: dt.code } },
            update: {
                name: dt.name,
                prefix: dt.prefix
            },
            create: {
                tenantId: flintHq.id,
                name: dt.name,
                code: dt.code,
                isSystem: true,
                prefix: dt.prefix
            }
        });

        await prisma.docSequence.upsert({
            where: { tenantId_docTypeId: { tenantId: flintHq.id, docTypeId: docType.id } },
            update: {
                nextNumber: dt.nextNum,
                prefix: dt.prefix
            },
            create: {
                tenantId: flintHq.id,
                docTypeId: docType.id,
                prefix: dt.prefix,
                nextNumber: dt.nextNum,
                format: `{prefix}{number}`
            }
        });
    }

    console.log('📜 Initialized System DocTypes & Sequences');
    console.log('✅ Seeding Completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
