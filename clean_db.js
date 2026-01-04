const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const target = 'data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2728%27%20height=%2728%27/%3e';

  console.log('Cleaning categories...');
  const categoryResult = await prisma.category.updateMany({
    where: {
      icon: target
    },
    data: {
      icon: null
    }
  });
  console.log(`Updated ${categoryResult.count} categories.`);

  console.log('Cleaning amenities...');
  const amenityResult = await prisma.amenity.updateMany({
    where: {
      icon: target
    },
    data: {
      icon: null
    }
  });
  console.log(`Updated ${amenityResult.count} amenities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
