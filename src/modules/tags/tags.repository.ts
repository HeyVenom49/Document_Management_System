import { and, eq } from "drizzle-orm";
import { db } from "../../database/index.ts";
import { tags } from "../../database/schema/tags.ts";
import { documentTags } from "../../database/schema/documentTags.ts";

export class TagRepository {
  async create(name: string, ownerId: string) {
    const [tag] = await db.insert(tags).values({ name, ownerId }).returning();
    return tag;
  }

  async findByOwnerId(ownerId: string) {
    return await db.select().from(tags).where(eq(tags.ownerId, ownerId));
  }

  async findById(tagId: string) {
    const [tag] = await db.select().from(tags).where(eq(tags.id, tagId));

    return tag ?? null;
  }

  async delete(tagId: string) {
    await db.delete(tags).where(eq(tags.id, tagId));
  }

  async attachToDocument(documentId: string, tagId: string) {
    const [relation] = await db
      .insert(documentTags)
      .values({ documentId, tagId })
      .returning();
    return relation;
  }

  async removeFromDocument(documentId: string, tagId: string) {
    await db
      .delete(documentTags)
      .where(and(eq(documentTags.documentId, documentId), eq(tags.id, tagId)));
  }

  async getDocumentTags(documentId: string) {
    return await db
      .select({
        id: tags.id,
        name: tags.name,
        createdAt: tags.createdAt,
      })
      .from(documentTags)
      .innerJoin(tags, eq(documentTags.tagId, tags.id))
      .where(eq(documentTags.documentId, documentId));
  }
}
