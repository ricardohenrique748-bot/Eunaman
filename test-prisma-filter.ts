import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function testFilter() {
  console.log('Testing with status: PLANEJADA')
  const ordens = await db.ordemServico.findMany({
    where: {
      status: 'PLANEJADA'
    },
    include: {
      veiculo: true
    }
  })
  console.log(`Found ${ordens.length} orders with status PLANEJADA`)
  if (ordens.length > 0) {
    console.log('First order status:', ordens[0].status)
  }
}

testFilter().catch(console.error).finally(() => db.$disconnect())
