import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const designs = await prisma.productDesign.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log('---START---');
    console.log(JSON.stringify(designs));
    console.log('---END---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
