import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { upload } from "../../common/middleware/upload.middleware.ts";
import { route } from "../../common/http/route.ts";
import { versionController } from "./version.controller.ts";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  route(versionController, "uploadVersion"),
);
router.get("/", authMiddleware, route(versionController, "getVersions"));
router.post(
  "/:versionId/restore",
  authMiddleware,
  route(versionController, "restoreVersion"),
);
router.get(
  "/:versionId",
  authMiddleware,
  route(versionController, "getVersionById"),
);

export default router;
