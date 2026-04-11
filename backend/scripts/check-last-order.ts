import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  if (!lastOrder) {
    console.log("No orders found.");
    return;
  }

  console.log(`Found last order: ID=${lastOrder.id}, Customer=${lastOrder.customerName}, CreatedAt=${lastOrder.createdAt}`);

  // Items are deleted automatically if cascade but maybe not.
  // Prisma delete for Order needs to handle relations.
  // OrderItem has onDelete: Cascade if defined in schema?
  // Let's check schema for OrderItem.
}

main();
