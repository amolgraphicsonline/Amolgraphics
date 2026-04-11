const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      include: { category: true }
    });
    console.log(`Total count: ${await prisma.product.count()}`);
    console.log('Products sample:', JSON.stringify(products.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        category: p.category?.name
    })), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
