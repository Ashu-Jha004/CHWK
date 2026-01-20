import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const businesses = await prisma.business.findMany({ select: { name: true, latitude: true, longitude: true, city: true } });
  console.log(JSON.stringify(businesses, null, 2));
}
main().finally(() => prisma.$disconnect());
