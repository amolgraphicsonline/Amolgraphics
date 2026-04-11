
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sourceId = "cmmrnehlu0000h2z2b58zblv8"; // Archived Acrylic Photo Frame
  const targetId = "cat_1773599186893";       // New Acrylic photo

  const updateCount = await prisma.product.updateMany({
    where: { categoryId: sourceId },
    data: { categoryId: targetId }
  });

  console.log(`Successfully migrated ${updateCount.count} products to the new category.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
