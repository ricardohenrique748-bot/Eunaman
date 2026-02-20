import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
p.checklistFormulario.findMany()
    .then(r => { console.log(JSON.stringify(r, null, 2)); p.$disconnect(); })
    .catch(e => { console.error('ERRO:', e.message); p.$disconnect(); })
