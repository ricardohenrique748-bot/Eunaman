const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Testing connection...')
        const userCount = await prisma.usuario.count()
        console.log('Connection successful! User count:', userCount)
    } catch (e) {
        console.error('Connection failed!')
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
