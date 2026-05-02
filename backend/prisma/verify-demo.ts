import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const emails = ['admin@bookingdeo.com', 'free@bookingdeo.com', 'pro@bookingdeo.com'];
    for (const email of emails) {
        const u = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true, email: true, isActive: true, isSuperAdmin: true,
                tenantId: true, role: true, password: true, firstName: true,
            },
        });
        if (!u) {
            console.log(`❌ ${email}: NOT FOUND in DB`);
            continue;
        }
        const passwordOk = await bcrypt.compare('demo1234', u.password);
        console.log(`${passwordOk ? '✅' : '❌'} ${email}`);
        console.log(`   id=${u.id}`);
        console.log(`   firstName=${u.firstName} role=${u.role} isActive=${u.isActive} isSuperAdmin=${u.isSuperAdmin}`);
        console.log(`   tenantId=${u.tenantId || '(none)'}`);
        console.log(`   password hash starts: ${u.password.slice(0, 12)}...`);
        console.log(`   bcrypt verify('demo1234') = ${passwordOk}`);
        console.log('');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
