const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'prisma', 'seeds', 'categories-amenities.ts'),
  path.join(__dirname, 'prisma', 'seed.ts'),
  path.join(__dirname, 'seed.json'),
  path.join(__dirname, 'prisma', 'paste.txt')
];

const target = 'data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2728%27%20height=%2728%27/%3e';

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Processing ${file}...`);
    let content = fs.readFileSync(file, 'utf8');
    // Replace the specific iconSrc string with null
    // We target the whole line to make it cleaner
    const regex = new RegExp(`iconSrc:\\s*"${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    content = content.replace(regex, 'iconSrc: null');

    // Also handle if it's in a JSON file as a value
    const jsonRegex = new RegExp(`"${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    content = content.replace(jsonRegex, 'null');

    fs.writeFileSync(file, content);
    console.log(`Done with ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
