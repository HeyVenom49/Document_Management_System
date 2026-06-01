import { eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { users } from "../../database/schema/users.ts";

export class UserRepository {
  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        password_hash: data.passwordHash,
      })
      .returning();
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }
}

export const userRepository = new UserRepository();
