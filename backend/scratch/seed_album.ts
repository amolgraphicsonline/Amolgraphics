import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const catId = 'cat_photo_album_' + Date.now();
  await prisma.$executeRawUnsafe(`
    INSERT INTO category (id, name, slug, description, isActive, \`order\`, createdAt, updatedAt, tags)
    VALUES ('${catId}', 'Photo Album', 'photo-album', 'A4 Size Hard Cover Photo Album', 1, 20, NOW(), NOW(), 'Album, Personalized, Memory')
    ON DUPLICATE KEY UPDATE name=name;
  `);
  
  const prodId = 'prod_photo_album_' + Date.now();
  await prisma.$executeRawUnsafe(`
    INSERT INTO product (id, name, slug, description, regularPrice, salePrice, isActive, categoryId, productType, stockStatus, status, createdAt, updatedAt)
    VALUES ('${prodId}', 'A4 Size Hard Cover Photo Album', 'a4-hard-cover-photo-album', 'Premium quality A4 size photo album with hard cover and custom themes.', 1999, 999, 1, '${catId}', 'SIMPLE', 'IN_STOCK', 'PUBLISHED', NOW(), NOW())
    ON DUPLICATE KEY UPDATE name=name;
  `);

  console.log('Seeded Album Category and Product successfully via RAW SQL.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
