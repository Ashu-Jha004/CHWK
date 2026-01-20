const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.business.count();
    console.log('Total Businesses:', count);

    if (count > 0) {
      const b = await prisma.business.findFirst();
      console.log('Sample Business:', JSON.stringify(b, null, 2));
    } else {
      console.log('No businesses found in the database.');
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
