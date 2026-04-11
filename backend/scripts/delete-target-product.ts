import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: { name: "PREMIUM ACRYLIC FRAME" }
  });

  if (!product) {
    console.log("Product not found with exact name. Searching with contains...");
    const p2 = await prisma.product.findFirst({
        where: { name: { contains: "PREMIUM ACRYLIC FRAME" } }
    });
    if (!p2) {
        console.log("Still not found.");
        return;
    }
    console.log(`Deleting product: ID=${p2.id}, Name=${p2.name}`);
    await prisma.product.delete({ where: { id: p2.id } });
  } else {
    console.log(`Deleting product: ID=${product.id}, Name=${product.name}`);
    await prisma.product.delete({ where: { id: product.id } });
  }
  
  console.log("Product deleted successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
