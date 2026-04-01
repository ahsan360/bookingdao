import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTenants() {
    const tenants = await prisma.tenant.findMany({
        select: {
            subdomain: true,
            businessName: true,
            email: true,
        },
    });

    console.log('\n=== Registered Tenants ===');
    if (tenants.length === 0) {
        console.log('No tenants found. Please register a business first.');
    } else {
        tenants.forEach((tenant, index) => {
            console.log(`\n${index + 1}. Business: ${tenant.businessName}`);
            console.log(`   Subdomain: ${tenant.subdomain}`);
            console.log(`   Email: ${tenant.email}`);
            console.log(`   Booking URL: http://${tenant.subdomain}.localhost:3000/book`);
        });
    }
    console.log('\n');

    await prisma.$disconnect();
}

checkTenants();
