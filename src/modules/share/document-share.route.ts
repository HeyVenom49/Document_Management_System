import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { documentShareController } from "./document-share.controller.ts";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authMiddleware,
  documentShareController.shareDocument.bind(documentShareController),
);

router.delete(
  "/:sharedUserId",
  authMiddleware,
  documentShareController.removeShare.bind(documentShareController),
);

export default router;
