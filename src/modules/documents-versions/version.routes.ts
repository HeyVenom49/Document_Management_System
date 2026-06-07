import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { upload } from "../../common/middleware/upload.middleware.ts";
import { versionController } from "./version.controller.ts";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  versionController.uploadVersion.bind(versionController),
);

router.get(
  "/",
  authMiddleware,
  versionController.getVersions.bind(versionController),
);

router.get(
  "/:versionId",
  authMiddleware,
  versionController.getVersionById.bind(versionController),
);

export default router;
