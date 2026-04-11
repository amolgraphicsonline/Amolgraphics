import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient()

async function main() {
  console.log('--- START SEEDING WALL CLOCK COLLECTION ---');

  // 1. Create the Main Clocks Category
  const clockCat = await prisma.category.upsert({
    where: { slug: 'clocks' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Acrylic Wall Clocks',
      slug: 'clocks',
      description: 'Premium acrylic wall clocks with custom photo personalization.',
      image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=400',
      isActive: true,
      order: 2,
    },
  });
  console.log(`Category: ${clockCat.name} (Ready)`);

  // 2. Define the Clock Design Shapes
  const designs = [
    { name: "Scalloped Modern", shape: "scalloped", price: 0 },
    { name: "Fluid Blob Clock", shape: "blob", price: 50 },
    { name: "Classic Circle Clock", shape: "circle", price: 0 },
    { name: "Heartfelt Time", shape: "heart", price: 100 },
    { name: "Portrait Clock", shape: "portrait", price: 50 },
    { name: "Oval Portrait Clock", shape: "oval", price: 50 },
    { name: "Square Classic Clock", shape: "square", price: 0 },
    { name: "Multi-Photo Grid Clock", shape: "grid", price: 150, photoCount: 4 },
    { name: "4-Cell Collage Clock", shape: "collage-4", price: 200, photoCount: 4 },
  ];

  for (const d of designs) {
    const slug = d.name.toLowerCase().replace(/ /g, '-');
    await prisma.productDesign.upsert({
      where: { id: `clock-design-${d.shape}` },
      update: {
        name: d.name,
        category: 'clocks',
        shape: d.shape,
        photoCount: d.photoCount || 1,
        priceAdjustment: d.price,
      },
      create: {
        id: `clock-design-${d.shape}`,
        name: d.name,
        description: `Custom ${d.name} with premium clock movement.`,
        previewImage: `https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=400`,
        category: 'clocks',
        isActive: true,
        photoCount: d.photoCount || 1,
        priceAdjustment: d.price,
        shape: d.shape,
      },
    });
    console.log(`Design Ready: ${d.name}`);
  }

  // 3. SEED THE BIRTHDAY/ANNIVERSARY PLACEHOLDERS
  await prisma.productDesign.upsert({
    where: { id: 'specialty-birthday-1' },
    update: { category: 'birthday' },
    create: {
      id: 'specialty-birthday-1',
      name: 'Birthday Polaroid Card',
      category: 'birthday',
      shape: 'portrait',
      previewImage: 'https://images.unsplash.com/photo-1530103862676-fa8c9d34da34?q=80&w=400',
      layoutJson: JSON.stringify([{
        id: "auto-birthday",
        shape: "rect",
        x: 160, 
        y: 300, 
        width: 680, 
        height: 460, 
        rotate: -5
      }]),
    }
  });
  console.log('Design Ready: Birthday Specialty Card');

  await prisma.productDesign.upsert({
    where: { id: 'specialty-anniversary-1' },
    update: { category: 'anniversary' },
    create: {
      id: 'specialty-anniversary-1',
      name: 'Anniversary Frame Card',
      category: 'anniversary',
      shape: 'landscape',
      previewImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400',
      layoutJson: JSON.stringify([{
        id: "auto-anniversary",
        shape: "rect",
        x: 180, 
        y: 280, 
        width: 640, 
        height: 480, 
        rotate: -3
      }]),
    }
  });
  console.log('Design Ready: Anniversary Specialty Card');

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
