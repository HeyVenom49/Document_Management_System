import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { route } from "../../common/http/route.ts";
import { auditController } from "./audit.controller.ts";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authMiddleware,
  route(auditController, "getDocumentActivity"),
);

export default router;
