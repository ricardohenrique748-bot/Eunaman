import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testar() {
    try {
        await prisma.usuario.create({
            data: {
                nome: 'Teste Error',
                email: 'error123@teste.com',
                senha: '123',
                perfil: 'ADMIN',
                area: 'GERAL',
                unidadePadraoId: null,
                ativo: true
            }
        });
        console.log("Success");
    } catch (e) {
        console.error("RAW ERROR IS:");
        console.error(e);
    }
}

testar().catch(console.error).finally(() => prisma.$disconnect());
