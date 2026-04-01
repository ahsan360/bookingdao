import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSchedule() {
    // Get the asdf tenant
    const tenant = await prisma.tenant.findUnique({
        where: { subdomain: 'asdf' }
    });

    if (!tenant) {
        console.log('❌ Tenant "asdf" not found');
        return;
    }

    console.log(`✅ Found tenant: ${tenant.businessName} (${tenant.subdomain})`);

    // Create schedules for Monday to Friday (1-5)
    const schedules = [];
    for (let day = 1; day <= 5; day++) {
        const schedule = await prisma.schedule.create({
            data: {
                tenantId: tenant.id,
                name: `Weekday Schedule`,
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30, // 30-minute slots
                isActive: true,
            },
        });
        schedules.push(schedule);
        console.log(`✅ Created schedule for day ${day}: ${schedule.startTime} - ${schedule.endTime}`);
    }

    console.log(`\n🎉 Created ${schedules.length} schedules!`);
    console.log(`\nNow visit: http://asdf.localhost:3000/book`);
    console.log(`You should see available time slots! 🚀\n`);

    await prisma.$disconnect();
}

createSchedule();
