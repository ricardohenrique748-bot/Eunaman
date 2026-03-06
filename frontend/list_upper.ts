import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.usuario.findMany({ select: { email: true } });
    const upper = users.filter(u => u.email !== u.email.toLowerCase());
    console.log("Users with uppercase emails:", upper);
}
main().catch(console.error).finally(() => prisma.$disconnect());
