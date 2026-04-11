
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const id = "cmmrnehlu0000h2z2b58zblv8";
  const timestamp = Date.now();
  const category = await prisma.category.findUnique({ where: { id } });
  
  if (category) {
    await prisma.category.update({
      where: { id },
      data: { 
        name: `${category.name} (archived-${timestamp})`,
        slug: `${category.slug}-archived-${timestamp}`,
        isActive: false
      }
    });
    console.log(`Category ${id} archived successfully.`);
  } else {
    console.log(`Category ${id} not found.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
