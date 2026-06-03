import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { upload } from "../../common/middleware/upload.middleware.ts";
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
  "/:id",
  authMiddleware,
  documentController.getDocumentById.bind(documentController),
);

export default router;
