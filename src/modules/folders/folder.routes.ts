import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { route } from "../../common/http/route.ts";
import { folderController } from "./folder.controller.ts";

const router = Router();

router.post("/", authMiddleware, route(folderController, "createFolder"));
router.get("/", authMiddleware, route(folderController, "getFolder"));

export default router;
