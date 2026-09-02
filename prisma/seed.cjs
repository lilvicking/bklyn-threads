// Seed script — plain CommonJS so it runs in the production image with
// `node` (no tsx / prisma CLI required). Run via: node prisma/seed.cjs
//
// ALWAYS upserts the ADMIN account so login credentials are guaranteed present
// on every boot. Demo catalog rows are only created when SEED_DEMO=true.
const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Admin user. Override via ADMIN_EMAIL / ADMIN_PASSWORD env; the committed
  // fallbacks are the working credentials for this storefront.
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@jayfab.org";
  const adminPass = process.env.ADMIN_PASSWORD ?? "Novejfab1224$";
  const hashed = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    // Always re-hash so the password stays in sync on every boot.
    update: { passwordHash: hashed },
    create: { email: adminEmail, passwordHash: hashed, role: Role.ADMIN },
  });

  // Demo catalog is optional — only created when SEED_DEMO=true.
  if (process.env.SEED_DEMO !== "true") {
    console.log("[seed] admin upserted:", adminEmail);
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
      category: "TEES",
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
      category: "HEADWEAR",
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
        status: "ACTIVE",
        basePrice: p.basePrice,
        collectionId: collection.id,
        variants: { create: p.variants },
      },
    });
  }

  console.log("[seed] complete. Admin:", adminEmail);
}

main()
  .catch((e) => {
    console.error("[seed] error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
