
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const ps = await prisma.product.findMany({
    include: { variants: { include: { variantAttributes: true } } }
  })
  console.log(JSON.stringify(ps, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
