import { clearDb } from "#server/utils/db-clear";
import { seedDb } from "#server/utils/db-seed";

/**
 * Reset task — `db:clear` then `db:seed` in one shot. Drops all auth + custom
 * tables and KV, then recreates demo admin/user and the games catalog.
 */
export default defineTask({
  meta: {
    name: "db:reset",
    description: "Clear DB + KV and reseed with demo data",
  },
  async run() {
    console.log("♻️  Starting database reset...");
    try {
      const counts = await clearDb();
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      console.log(`Truncated ${total} rows:`, counts);

      await seedDb();

      console.log("Reset completed successfully!");
      return { result: "Reset completed successfully", cleared: counts };
    } catch (error) {
      console.error("Reset failed:", error);
      return { result: "Reset failed", error: String(error) };
    }
  },
});
