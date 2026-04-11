const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function publishAllItems() {
  try {
    const updated = await prisma.product.updateMany({
      data: { status: 'PUBLISHED' }
    });
    console.log(`Updated ${updated.count} items to PUBLISHED status.`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

publishAllItems();
