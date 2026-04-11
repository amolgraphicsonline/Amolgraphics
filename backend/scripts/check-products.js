const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
main();
