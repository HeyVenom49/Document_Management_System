import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { route } from "../../common/http/route.ts";
import { tagController } from "./tags.controller.ts";

const router = Router();

router.post("/", authMiddleware, route(tagController, "create"));
router.get("/", authMiddleware, route(tagController, "getTags"));
router.delete("/:tagId", authMiddleware, route(tagController, "deleteTag"));

export default router;
