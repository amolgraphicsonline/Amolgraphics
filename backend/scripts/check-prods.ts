import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count()
  console.log(`Product count: ${count}`)
  const prods = await prisma.product.findMany({ take: 5 })
  console.log(JSON.stringify(prods, null, 2))
}
main()
