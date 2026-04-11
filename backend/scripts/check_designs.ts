import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const designs = await prisma.productDesign.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(designs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
