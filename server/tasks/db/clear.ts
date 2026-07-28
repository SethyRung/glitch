import { clearDb } from "#server/utils/db-clear";

/**
 * Clear task — wipes ALL database tables (auth + custom) and the NuxtHub KV
 * namespace. Destructive: invalidates every active session and removes demo
 * accounts. Pair with `db:seed` (or use `db:reset`) to repopulate.
 */
export default defineTask({
  meta: {
    name: "db:clear",
    description: "Truncate all DB tables and clear NuxtHub KV",
  },
  async run() {
    console.log("🧹 Starting database clear...");
    try {
      const counts = await clearDb();
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      console.log(`Truncated ${total} rows:`, counts);
      console.log("Cleared NuxtHub KV");
      console.log("Clear completed successfully!");
      return { result: "Clear completed successfully", counts };
    } catch (error) {
      console.error("Clear failed:", error);
      return { result: "Clear failed", error: String(error) };
    }
  },
});
