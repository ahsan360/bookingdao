import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding plans...');

    const plans = [
        {
            name: 'starter',
            displayName: 'Starter',
            maxAdmins: 2, // owner + 1 admin
            maxSchedules: 1,
            maxAppointmentsPerMonth: 50,
            monthlyPrice: 0,
            features: { paymentGateway: false, export: false, multiLingual: false },
        },
        {
            name: 'pro',
            displayName: 'Pro',
            maxAdmins: 2,
            maxSchedules: 3,
            maxAppointmentsPerMonth: 500,
            monthlyPrice: 999,
            features: { paymentGateway: true, export: false, multiLingual: false },
        },
        {
            name: 'elite',
            displayName: 'Elite',
            maxAdmins: 6,
            maxSchedules: -1, // unlimited
            maxAppointmentsPerMonth: -1, // unlimited
            monthlyPrice: 2999,
            features: { paymentGateway: true, export: true, multiLingual: true },
        },
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan,
        });
        console.log(`  ✓ ${plan.displayName} plan`);
    }

    // Assign starter plan to any tenants without a plan
    const starterPlan = await prisma.plan.findUnique({ where: { name: 'starter' } });
    if (starterPlan) {
        const updated = await prisma.tenant.updateMany({
            where: { planId: null },
            data: { planId: starterPlan.id },
        });
        if (updated.count > 0) {
            console.log(`  ✓ Assigned starter plan to ${updated.count} existing tenant(s)`);
        }
    }

    // Update any existing users with role "admin" who are the only user in their tenant to "owner"
    const tenants = await prisma.tenant.findMany({
        select: { id: true },
    });

    for (const tenant of tenants) {
        const users = await prisma.user.findMany({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: 'asc' },
        });

        if (users.length > 0 && users[0].role !== 'owner') {
            await prisma.user.update({
                where: { id: users[0].id },
                data: { role: 'owner' },
            });
            console.log(`  ✓ Set ${users[0].email || users[0].phone || users[0].id} as owner of tenant ${tenant.id}`);
        }
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
