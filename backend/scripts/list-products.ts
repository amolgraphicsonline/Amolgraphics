
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const p = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
    take: 10
  })
  console.log(JSON.stringify(p, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
