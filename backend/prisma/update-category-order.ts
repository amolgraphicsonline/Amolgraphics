
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    'Photo Album',
    'Fridge Magnet',
    'Photo Gallery Set',
    'Name Pencil',
    'Photo Lamp',
    'Glossy Polaroid Prints',
    'Acrylic Photo',
  ];

  console.log('Updating top category order...');

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.update({
      where: { name: categories[i] },
      data: { order: i },
    });
  }

  const acrylicPhoto = await prisma.category.findUnique({
    where: { name: 'Acrylic Photo' },
    include: { children: true }
  });

  if (acrylicPhoto) {
    const subCategories = [
      'Acrylic Photo Frame',
      'Acrylic Wall Clock',
      'Acrylic Gold Photo',
    ];

    console.log('Updating sub-category order for Acrylic Photo...');

    for (let i = 0; i < subCategories.length; i++) {
      await prisma.category.update({
        where: { name: subCategories[i] },
        data: { order: i, parentId: acrylicPhoto.id },
      });
    }
  }

  console.log('Order update completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
