import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } }
  });
  console.log('Categories:', JSON.stringify(categories, null, 2));

  const products = await prisma.product.findMany({
    where: { name: { contains: 'Album' } }
  });
  console.log('Album Products:', JSON.stringify(products, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
