import { NotFound } from "../errors/not-found.error.ts";
import { documentRepository } from "../../modules/documents/document.repository.ts";
import { folderRepository } from "../../modules/folders/folder.repository.ts";
import { tagRepository } from "../../modules/tags/tags.repository.ts";

type OwnedResource = { ownerId: string };

export function assertOwned<T extends OwnedResource>(
  resource: T | null | undefined,
  userId: string,
  notFoundMessage: string,
): T {
  if (!resource || resource.ownerId !== userId) {
    throw new NotFound(notFoundMessage);
  }
  return resource;
}

export async function assertDocumentOwner(documentId: string, userId: string) {
  const document = await documentRepository.findById(documentId);
  return assertOwned(document, userId, "Document not found");
}

export async function assertDocumentOwnerIncludingDeleted(
  documentId: string,
  userId: string,
) {
  const document =
    await documentRepository.findDocumentsIncludingDeleted(documentId);
  return assertOwned(document, userId, "Document not found");
}

export async function assertFolderOwner(
  folderId: string,
  userId: string,
  notFoundMessage = "Folder not found",
) {
  const folder = await folderRepository.findById(folderId);
  return assertOwned(folder, userId, notFoundMessage);
}

export async function assertTagOwner(tagId: string, userId: string) {
  const tag = await tagRepository.findById(tagId);
  return assertOwned(tag, userId, "Tag not found");
}
