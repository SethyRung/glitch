import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games, user } from "hub:db:schema";
import { DATA, DEMO_ADMIN, DEMO_USER } from "#server/data";

/**
 * Seed task for database initialization.
 *
 * Creates demo admin + user accounts via Better Auth, then seeds the games
 * catalog. Idempotent: re-running skips rows that already exist.
 */
export default defineTask({
  meta: {
    name: "db:seed",
    description: "Seed database with demo users and Steam game products",
  },
  async run() {
    console.log("🌱 Starting database seed...");

    try {
      await seedUser(DEMO_ADMIN);
      await seedUser(DEMO_USER);

      const existingGames = await db.query.games.findMany();
      if (existingGames.length === 0) {
        await db.insert(games).values(DATA.map((game) => ({ id: randomUUID(), ...game })));
        console.log(`Created ${DATA.length} sample games`);
      } else {
        console.log(`Games already exist (${existingGames.length} items)`);
      }

      console.log("Seed completed successfully!");
      return { result: "Seed completed successfully" };
    } catch (error) {
      console.error("Seed failed:", error);
      return { result: "Seed failed", error: String(error) };
    }
  },
});

/**
 * Idempotently upsert a user.
 *
 * Goes through Better Auth so the password hash, account row, and email
 * verification state are written exactly the way the running app expects.
 * After sign-up we patch `role` directly because the public sign-up endpoint
 * always assigns `defaultRole` (here: `user`).
 */
async function seedUser(seed: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}): Promise<void> {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, seed.email),
  });

  if (existing) {
    if (existing.role !== seed.role) {
      await db.update(user).set({ role: seed.role }).where(eq(user.id, existing.id));
      console.log(`Updated role for ${seed.email} → ${seed.role}`);
    } else {
      console.log(`User already exists: ${seed.email}`);
    }
    return;
  }

  const auth = serverAuth();
  const result = await auth.api.signUpEmail({
    body: {
      email: seed.email,
      password: seed.password,
      name: seed.name,
    },
  });

  await db.update(user).set({ role: seed.role }).where(eq(user.id, result.user.id));
  console.log(`Created ${seed.role} user: ${seed.email} (password: ${seed.password})`);
}
