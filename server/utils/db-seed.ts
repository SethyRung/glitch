import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@nuxthub/db";
import { games, user } from "hub:db:schema";
import { DATA, DEMO_ADMIN, DEMO_USER } from "#server/data";

export async function seedDb(): Promise<{ games: number; users: number }> {
  await seedUser(DEMO_ADMIN);
  await seedUser(DEMO_USER);

  const existingGames = await db.query.games.findMany();
  if (existingGames.length === 0) {
    await db.insert(games).values(DATA.map((game) => ({ id: randomUUID(), ...game })));
    console.log(`Created ${DATA.length} sample games`);
    return { games: DATA.length, users: 0 };
  }

  console.log(`Games already exist (${existingGames.length} items)`);
  return { games: 0, users: 0 };
}

/**
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
