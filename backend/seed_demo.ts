import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const category = await prisma.category.upsert({
    where: { name: 'Acrylic Frames' },
    update: {},
    create: {
      id: 'cat_acrylic',
      name: 'Acrylic Frames',
      slug: 'acrylic-frames',
      description: 'Premium acrylic frames'
    }
  })

  const product = await prisma.product.upsert({
    where: { slug: 'premium-acrylic-frame' },
    update: {},
    create: {
      id: 'prod_acrylic_demo',
      name: 'Premium Acrylic Frame',
      slug: 'premium-acrylic-frame',
      description: 'High quality acrylic printing',
      categoryId: category.id,
      regularPrice: 549,
      status: 'PUBLISHED'
    }
  })

  console.log('Seed successful:', product.id)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
