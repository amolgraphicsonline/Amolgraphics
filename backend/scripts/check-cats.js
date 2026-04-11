const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
  console.log("CATEGORIES:", JSON.stringify(cats, null, 2));
  
  const products = await prisma.product.findMany({ 
    take: 10,
    select: { id: true, name: true, category: { select: { name: true } } }
  });
  console.log("PRODUCTS:", JSON.stringify(products, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
