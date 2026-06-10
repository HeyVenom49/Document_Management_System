import { eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { refreshTokens } from "../../database/schema/refresh-token.ts";

export class RefreshTokenRepository {
  async create(userId: string, expireAt: Date) {
    const [refreshToken] = await db
      .insert(refreshTokens)
      .values({ userId, expireAt })
      .returning();

    return refreshToken;
  }

  async findByToken(token: string) {
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));
    return refreshToken ?? null;
  }

  async deleteByToken(token: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteByUserId(userId: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
