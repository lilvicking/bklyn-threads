// Seed script: `npm run db:seed`
import { PrismaClient, Category, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user. Override email/password via ADMIN_EMAIL / ADMIN_PASSWORD env.
  // NOTE: the fallback password below is committed for dev convenience — set
  // ADMIN_PASSWORD on the host (Railway) to avoid shipping it in source.
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@bklynthreads.store";
  const adminPass = process.env.ADMIN_PASSWORD ?? "Novejfab1224$";
  const hashed = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    // Re-seeding resets the ADMIN password so deploys keep login credentials
    // in sync with the configured ADMIN_PASSWORD (or the fallback above).
    update: { passwordHash: hashed },
    create: { email: adminEmail, passwordHash: hashed, role: Role.ADMIN },
  });

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