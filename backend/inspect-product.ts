
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { id: "prod_1773652996372" },
    include: { variants: true }
  });
  console.log(JSON.stringify(product, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
