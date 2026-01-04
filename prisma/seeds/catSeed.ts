import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type PasteSubSub = { text: string };
type PasteSub = { text: string; subSubCategories?: PasteSubSub[] };
type PasteTop = { text: string; iconSrc?: string; subCategories?: PasteSub[] };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makePathName(parts: string[]) {
  // Keeps `name` unique even when "Services/Hardware" repeats in many branches.
  return parts.join(" > ");
}

function makePathSlug(parts: string[]) {
  return parts.map(slugify).filter(Boolean).join("-");
}

async function upsertCategory(opts: {
  pathParts: string[];
  icon?: string | null;
  parentId?: string | null;
  displayOrder?: number | null;
}) {
  const name = makePathName(opts.pathParts);
  const slug = makePathSlug(opts.pathParts);

  return prisma.category.upsert({
    where: { slug },
    update: {
      name,
      icon: opts.icon ?? undefined,
      parentId: opts.parentId ?? null,
      displayOrder: opts.displayOrder ?? undefined,
      isActive: true,
    },
    create: {
      name,
      slug,
      icon: opts.icon ?? null,
      parentId: opts.parentId ?? null,
      displayOrder: opts.displayOrder ?? null,
      isActive: true,
      isFeatured: opts.parentId ? false : true,
    },
  });
}

async function main() {
  // Put paste.txt somewhere stable in your repo. Default below assumes: prisma/paste.txt
  const dataPath =
    process.env.CATEGORIES_JSON_PATH ?? path.join(process.cwd(), "prisma", "paste.txt");

  const raw = fs.readFileSync(dataPath, "utf8");
  const topLevel = JSON.parse(raw) as PasteTop[];

  console.log(`Seeding categories from: ${dataPath}`);
  console.log(`Top-level categories: ${topLevel.length}`);

  let createdOrUpdated = 0;

  for (let i = 0; i < topLevel.length; i++) {
    const top = topLevel[i];
    const topNode = await upsertCategory({
      pathParts: [top.text],
      icon: top.iconSrc ?? null,
      parentId: null,
      displayOrder: i + 1,
    });
    createdOrUpdated++;

    const subs = top.subCategories ?? [];
    for (let j = 0; j < subs.length; j++) {
      const sub = subs[j];
      const subNode = await upsertCategory({
        pathParts: [top.text, sub.text],
        parentId: topNode.id,
        displayOrder: j + 1,
      });
      createdOrUpdated++;

      const subSubs = sub.subSubCategories ?? [];
      for (let k = 0; k < subSubs.length; k++) {
        const subSub = subSubs[k];
        await upsertCategory({
          pathParts: [top.text, sub.text, subSub.text],
          parentId: subNode.id,
          displayOrder: k + 1,
        });
        createdOrUpdated++;
      }
    }
  }

  console.log(`Done. Upsert operations: ${createdOrUpdated}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
