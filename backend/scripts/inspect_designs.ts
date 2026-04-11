
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const designs = await prisma.productDesign.findMany({
    where: {
      OR: [
        { name: { contains: 'BDAY' } },
        { name: { contains: 'Birthday' } }
      ]
    }
  });

  console.log(JSON.stringify(designs, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
