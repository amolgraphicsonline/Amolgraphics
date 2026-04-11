import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!lastOrder) {
    console.log("No orders found to delete.");
    return;
  }

  console.log(`Deleting last order: ID=${lastOrder.id}, Customer=${lastOrder.customerName}`);
  await prisma.order.delete({ where: { id: lastOrder.id } });
  console.log("Order deleted successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
