import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Pro feature flags — kept in sync with services/entitlements.service.ts
const FREE_FEATURES = {
    paymentGateway: false,
    customerCRM: false,
    salesAnalytics: false,
    campaigns: false,
    auditLog: false,
    customBranding: false,
    pageEditor: false,
    removeBranding: false,
};

const PRO_FEATURES = {
    paymentGateway: true,
    customerCRM: true,
    salesAnalytics: true,
    campaigns: true,
    auditLog: true,
    customBranding: true,
    pageEditor: true,
    removeBranding: true,
};

const DEMO_PASSWORD = 'demo1234';

async function main() {
    console.log('Seeding plans...');

    const plans = [
        {
            name: 'free',
            displayName: 'Free',
            maxAdmins: 1,
            maxSchedules: 1,
            maxAppointmentsPerMonth: 50,
            monthlyPrice: 0, // USD cents
            features: FREE_FEATURES,
        },
        {
            name: 'pro',
            displayName: 'Pro',
            maxAdmins: 5,
            maxSchedules: -1, // unlimited
            maxAppointmentsPerMonth: -1, // unlimited
            monthlyPrice: 1900, // $19.00 USD/month
            features: PRO_FEATURES,
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

    // Remove the old "starter" and "elite" plans if they exist (legacy from previous seed)
    const legacyDeleted = await prisma.plan.deleteMany({
        where: { name: { in: ['starter', 'elite'] } },
    });
    if (legacyDeleted.count > 0) {
        console.log(`  ✓ Removed ${legacyDeleted.count} legacy plan(s)`);
    }

    // Assign free plan to any tenant without one
    const freePlan = await prisma.plan.findUnique({ where: { name: 'free' } });
    if (freePlan) {
        const updated = await prisma.tenant.updateMany({
            where: { planId: null },
            data: { planId: freePlan.id },
        });
        if (updated.count > 0) {
            console.log(`  ✓ Assigned free plan to ${updated.count} existing tenant(s)`);
        }
    }

    // Backfill: any user that is the only/first user in their tenant should be marked owner
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
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

    // ─── Demo users ────────────────────────────────────────────────
    console.log('\nSeeding demo users...');
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const proPlan = await prisma.plan.findUnique({ where: { name: 'pro' } });

    // 1) Super admin (platform owner)
    await prisma.user.upsert({
        where: { email: 'admin@bookingdeo.com' },
        update: {
            isSuperAdmin: true,
            password: passwordHash,
            isActive: true,
        },
        create: {
            firstName: 'Platform',
            lastName: 'Admin',
            email: 'admin@bookingdeo.com',
            password: passwordHash,
            role: 'owner', // role is irrelevant when no tenant
            isSuperAdmin: true,
            isActive: true,
            emailVerified: true,
        },
    });
    console.log('  ✓ Super admin: admin@bookingdeo.com');

    // 2) Free tenant + owner
    const freeTenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo-free' },
        update: { proUntil: null, planId: freePlan?.id },
        create: {
            businessName: 'Acme Studio (Demo Free)',
            subdomain: 'demo-free',
            email: 'free@bookingdeo.com',
            planId: freePlan?.id,
            proUntil: null,
        },
    });
    await prisma.user.upsert({
        where: { email: 'free@bookingdeo.com' },
        update: {
            password: passwordHash,
            tenantId: freeTenant.id,
            role: 'owner',
            isActive: true,
        },
        create: {
            firstName: 'Sarah',
            lastName: 'Chen',
            email: 'free@bookingdeo.com',
            password: passwordHash,
            tenantId: freeTenant.id,
            role: 'owner',
            isActive: true,
            emailVerified: true,
        },
    });
    console.log('  ✓ Free user: free@bookingdeo.com (workspace: demo-free.bookingdeo.com)');

    // 3) Pro tenant + owner (Pro for 1 year)
    const proUntil = new Date();
    proUntil.setFullYear(proUntil.getFullYear() + 1);
    const proTenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo-pro' },
        update: { proUntil, planId: proPlan?.id },
        create: {
            businessName: 'Polished Spa & Salon (Demo Pro)',
            subdomain: 'demo-pro',
            email: 'pro@bookingdeo.com',
            planId: proPlan?.id,
            proUntil,
        },
    });
    await prisma.user.upsert({
        where: { email: 'pro@bookingdeo.com' },
        update: {
            password: passwordHash,
            tenantId: proTenant.id,
            role: 'owner',
            isActive: true,
        },
        create: {
            firstName: 'Daniel',
            lastName: 'Park',
            email: 'pro@bookingdeo.com',
            password: passwordHash,
            tenantId: proTenant.id,
            role: 'owner',
            isActive: true,
            emailVerified: true,
        },
    });
    console.log(`  ✓ Pro user: pro@bookingdeo.com (Pro until ${proUntil.toISOString().split('T')[0]})`);

    // Promote a super admin if SUPER_ADMIN_EMAIL env is set (idempotent)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (superAdminEmail) {
        const result = await prisma.user.updateMany({
            where: { email: superAdminEmail },
            data: { isSuperAdmin: true },
        });
        if (result.count > 0) {
            console.log(`  ✓ Promoted ${superAdminEmail} to super admin (from SUPER_ADMIN_EMAIL)`);
        }
    }

    console.log('\n┌──────────────────────────────────────────────────────────┐');
    console.log('│ DEMO CREDENTIALS  (password for all: demo1234)           │');
    console.log('├──────────────────────────────────────────────────────────┤');
    console.log('│ Super admin :  admin@bookingdeo.com                      │');
    console.log('│ Free user   :  free@bookingdeo.com   → demo-free workspace│');
    console.log('│ Pro user    :  pro@bookingdeo.com    → demo-pro workspace │');
    console.log('└──────────────────────────────────────────────────────────┘');

    console.log('\nSeeding complete!');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
