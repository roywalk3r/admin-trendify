import { seedDatabase } from "../prisma/seed";

(async () => {
  try {
    await seedDatabase();
    console.log("✅ Seed completed");
    process.exit(0);
  } catch (e) {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  }
})();
