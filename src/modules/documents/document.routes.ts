import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { upload } from "../../common/middleware/upload.middleware.ts";
import { route } from "../../common/http/route.ts";
import versionRoutes from "../documents-versions/version.routes.ts";
import shareRoutes from "../share/document-share.routes.ts";
import documentTagRoutes from "../tags/document-tags.routes.ts";
import { documentController } from "./document.controller.ts";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  route(documentController, "uploadDocument"),
);
router.get("/", authMiddleware, route(documentController, "getDocuments"));
router.get("/search", authMiddleware, route(documentController, "searchDocuments"));
router.get(
  "/folder/:folderId",
  authMiddleware,
  route(documentController, "getDocumentsByFolder"),
);
router.get("/trash", authMiddleware, route(documentController, "getTrash"));

router.use("/:documentId/versions", versionRoutes);
router.use("/:documentId/share", shareRoutes);
router.use("/:documentId/tags", documentTagRoutes);

router.get(
  "/:documentId",
  authMiddleware,
  route(documentController, "getDocumentById"),
);
router.patch(
  "/:documentId",
  authMiddleware,
  route(documentController, "updateDocument"),
);
router.post(
  "/:documentId/restore",
  authMiddleware,
  route(documentController, "restoreDocument"),
);
router.delete(
  "/:documentId",
  authMiddleware,
  route(documentController, "deleteDocument"),
);

export default router;
