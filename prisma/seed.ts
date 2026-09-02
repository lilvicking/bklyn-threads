// Seed script: `npm run db:seed`
import { PrismaClient, Category, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user — upserted on EVERY boot so the login credentials are always
  // present and in sync, even on freshly-provisioned databases.
  // Override via ADMIN_EMAIL / ADMIN_PASSWORD env (Railway); the committed
  // fallbacks below are the working credentials for this storefront.
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@jayfab.org";
  const adminPass = process.env.ADMIN_PASSWORD ?? "Novejfab1224$";
  const hashed = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    // Always re-hash so the password stays in sync with ADMIN_PASSWORD /
    // the fallback above, even if a previous deploy used an older value.
    update: { passwordHash: hashed },
    create: { email: adminEmail, passwordHash: hashed, role: Role.ADMIN },
  });

  // Demo catalog is optional — only created when SEED_DEMO=true so a live
  // store isn't seeded with placeholder products on every boot.
  if (process.env.SEED_DEMO !== "true") {
    console.log("Seed complete. Admin:", adminEmail);
    return;
  }

  const collection = await prisma.collection.upsert({
    where: { slug: "spring-drop" },
    update: {},
    create: {
      name: "Spring Drop",
      slug: "spring-drop",
      description: "Initial catalog seeding.",
    },
  });

  const demo = [
    {
      name: "Obsidian Box Tee",
      slug: "obsidian-box-tee",
      category: Category.TEES as Category,
      basePrice: 3200,
      variants: [
        { size: "S", sku: "OBS-TEE-S", stock: 12 },
        { size: "M", sku: "OBS-TEE-M", stock: 18 },
        { size: "L", sku: "OBS-TEE-L", stock: 9 },
      ],
    },
    {
      name: "Cardinal Snapback",
      slug: "cardinal-snapback",
      category: Category.HEADWEAR as Category,
      basePrice: 2800,
      variants: [{ sku: "CARD-HAT-OS", size: "OS", color: "Red", stock: 25 }],
    },
  ];

  for (const p of demo) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        category: p.category,
        status: "ACTIVE" as const,
        basePrice: p.basePrice,
        collectionId: collection.id,
        variants: {
          create: p.variants,
        },
      },
    });
  }

  console.log("Seed complete. Admin:", adminEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });