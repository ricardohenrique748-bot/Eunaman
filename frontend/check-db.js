const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const empresas = await prisma.empresa.findMany()
    const unidades = await prisma.unidade.findMany()
    console.log('Empresas:', empresas)
    console.log('Unidades:', unidades)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
