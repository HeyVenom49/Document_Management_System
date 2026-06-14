import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { upload } from "../../common/middleware/upload.middleware.ts";
import versionRoutes from "../documents-versions/version.routes.ts";
import shareRoutes from "../share/document-share.route.ts";
import { documentController } from "./document.controller.ts";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  documentController.uploadDocument.bind(documentController),
);

router.get(
  "/",
  authMiddleware,
  documentController.getDocuments.bind(documentController),
);

router.get(
  "/search",
  authMiddleware,
  documentController.searchDocuments.bind(documentController),
);

router.get(
  "/folder/:folderId",
  authMiddleware,
  documentController.getDocumentsByFolder.bind(documentController),
);

router.get(
  "/trash",
  authMiddleware,
  documentController.getTrash.bind(documentController),
);

router.use("/:documentId/versions", versionRoutes);

router.use("/:documentId/share", shareRoutes);

router.get(
  "/:id",
  authMiddleware,
  documentController.getDocumentById.bind(documentController),
);

router.patch(
  "/:id",
  authMiddleware,
  documentController.updateDocument.bind(documentController),
);

router.post(
  "/:id/restore",
  authMiddleware,
  documentController.restoreDocument.bind(documentController),
);

router.delete(
  "/:id",
  authMiddleware,
  documentController.deleteDocument.bind(documentController),
);

export default router;
