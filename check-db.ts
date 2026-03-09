import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    console.log('Users:', users.length)
    const shops = await prisma.vendorProfile.findMany()
    console.log('Shops:', shops.length)
    const orders = await prisma.order.findMany()
    console.log('Orders:', orders.length)
    const files = await prisma.orderFile.findMany()
    console.log('Files:', files.length)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
