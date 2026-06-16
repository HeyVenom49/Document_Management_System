import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { route } from "../../common/http/route.ts";
import { tagController } from "./tags.controller.ts";

const router = Router({ mergeParams: true });

router.get("/", authMiddleware, route(tagController, "getDocumentTags"));
router.post(
  "/",
  authMiddleware,
  route(tagController, "attachTagToDocument"),
);
router.delete(
  "/:tagId",
  authMiddleware,
  route(tagController, "removeTagFromDocument"),
);

export default router;
