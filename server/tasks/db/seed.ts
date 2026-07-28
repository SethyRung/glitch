import { seedDb } from "#server/utils/db-seed";

/**
 * Seed task — idempotent: re-running skips rows that already exist.
 * Use `db:reset` for a clean wipe + reseed.
 */
export default defineTask({
  meta: {
    name: "db:seed",
    description: "Seed database with demo users and Steam game products",
  },
  async run() {
    console.log("🌱 Starting database seed...");
    try {
      await seedDb();
      console.log("Seed completed successfully!");
      return { result: "Seed completed successfully" };
    } catch (error) {
      console.error("Seed failed:", error);
      return { result: "Seed failed", error: String(error) };
    }
  },
});
