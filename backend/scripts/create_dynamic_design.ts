import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const layout = [
    {
      id: "photo1",
      shape: "arch",
      x: 240,
      y: 215,
      width: 510,
      height: 435
    }
  ];

  const design = await prisma.productDesign.create({
    data: {
      id: "dynamic_birthday_01",
      name: "Birthday Animals (Dynamic)",
      description: "Customizable birthday template with arch photo mask",
      previewImage: "/uploads/birthday_mask_demo.jpg",
      photoCount: 1,
      layoutJson: JSON.stringify(layout),
      category: "acrylic",
      shape: "portrait",
      isActive: true,
      sortOrder: 0
    }
  });

  console.log("Created dynamic design:", design.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
