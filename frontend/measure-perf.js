
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function measure() {
    console.log('--- Perf Log Start ---');
    console.log('DB URL (partial):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) : 'MISSING');
    try {
        const u = await prisma.usuario.count(); console.log('Usuario:', u);
        const e = await prisma.empresa.count(); console.log('Empresa:', e);
        const un = await prisma.unidade.count(); console.log('Unidade:', un);
        const v = await prisma.veiculo.count(); console.log('Veiculo:', v);
        const os = await prisma.ordemServico.count(); console.log('OrdemServico:', os);

        const startQ = Date.now();
        const data = await prisma.ordemServico.findMany({ take: 50, include: { veiculo: true } });
        console.log('Query 50 OS time:', Date.now() - startQ, 'ms');
        console.log('Actual records fetched:', data.length);
    } catch (err) {
        console.error('Error:', err.message);
    }
    console.log('--- Perf Log End ---');
    await prisma.$disconnect();
}

measure();
