const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDesignCounts() {
  try {
    const products = await prisma.product.count();
    const designs = await prisma.productDesign.count();
    console.log(`- Products: ${products}`);
    console.log(`- ProductDesigns: ${designs}`);
    
    // Check if any product has categoryId mapping
    const productsByCat = await prisma.product.groupBy({
        by: ['categoryId'],
        _count: true
    });
    console.log('Products by Category ID:', JSON.stringify(productsByCat, null, 2));

    const cats = await prisma.category.findMany({ select: { id: true, name: true } });
    console.log('Categories Master:', JSON.stringify(cats, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDesignCounts();
