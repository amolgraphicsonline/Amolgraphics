import prisma from "./lib/prisma";

async function main() {
  try {
    const count = await prisma.contactMessage.count();
    console.log("ContactMessage count:", count);
  } catch (err) {
    console.error("Prisma error:", err);
  }
}

main();
