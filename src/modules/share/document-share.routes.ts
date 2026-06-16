import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { route } from "../../common/http/route.ts";
import { documentShareController } from "./document-share.controller.ts";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, route(documentShareController, "shareDocument"));
router.delete(
  "/:sharedUserId",
  authMiddleware,
  route(documentShareController, "removeShare"),
);

export default router;
