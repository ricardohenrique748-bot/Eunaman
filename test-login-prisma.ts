
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testLogin(email: string) {
  try {
    console.log(`Testing login for ${email}...`)
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        unidadePadrao: true
      }
    })
    
    if (!user) {
      console.log('User not found.')
      return
    }
    
    console.log('User found:', user.nome)
    console.log('Unidade:', user.unidadePadrao?.nome || 'Nenhuma')
  } catch (err) {
    console.error('Error during testLogin:', err)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin('ricardo.luz@eunaman.com.br')
