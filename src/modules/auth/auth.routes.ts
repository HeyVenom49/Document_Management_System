import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { route } from "../../common/http/route.ts";
import { authController } from "./auth.controller.ts";

const router = Router();

router.post("/register", route(authController, "register"));
router.post("/login", route(authController, "login"));
router.get("/me", authMiddleware, route(authController, "me"));
router.post("/refresh", authMiddleware, route(authController, "refreshToken"));
router.post("/logout", authMiddleware, route(authController, "logout"));

export default router;
