const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDiagnostics() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    console.log('--- PRODUCTS IN DB ---');
    products.forEach(p => {
        console.log(`[${p.status}] ${p.name} | Category: ${p.category?.name} | ID: ${p.id}`);
    });

    const designs = await prisma.productDesign.findMany({ take: 5 });
    console.log('\n--- DESIGNS IN DB (UP TO 5) ---');
    designs.forEach(d => {
        console.log(`${d.name} | Category: ${d.category} | Shape: ${d.shape}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDiagnostics();
