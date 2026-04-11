
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Photo Album', slug: 'photo-album' },
    { name: 'Fridge Magnet', slug: 'fridge-magnet' },
    { name: 'Photo Gallery Set', slug: 'photo-gallery-set' },
    { name: 'Name Pencil', slug: 'name-pencil' },
    { name: 'Photo Lamp', slug: 'photo-lamp' },
    { name: 'Glossy Polaroid Prints', slug: 'glossy-polaroid-prints' },
    { name: 'Acrylic Photo', slug: 'acrylic-photo' },
  ];

  console.log('Seeding top categories...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: cat.name,
        slug: cat.slug,
        isActive: true,
      },
    });
  }

  const acrylicPhoto = await prisma.category.findUnique({
    where: { name: 'Acrylic Photo' },
  });

  if (acrylicPhoto) {
    const subCategories = [
      { name: 'Acrylic Photo Frame', slug: 'acrylic-photo-frame' },
      { name: 'Acrylic Wall Clock', slug: 'acrylic-wall-clock' },
      { name: 'Acrylic Gold Photo', slug: 'acrylic-gold-photo' },
    ];

    console.log('Seeding sub-categories for Acrylic Photo...');

    for (const sub of subCategories) {
      await prisma.category.upsert({
        where: { name: sub.name },
        update: { parentId: acrylicPhoto.id },
        create: {
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: sub.name,
          slug: sub.slug,
          parentId: acrylicPhoto.id,
          isActive: true,
        },
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
