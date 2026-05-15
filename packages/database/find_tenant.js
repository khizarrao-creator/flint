
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany();
    console.log('DATA_START');
    console.log(JSON.stringify(tenants));
    console.log('DATA_END');
}

main().catch(console.error).finally(() => prisma.$disconnect());
