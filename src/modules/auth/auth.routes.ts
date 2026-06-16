import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { authRateLimiter } from "../../common/middleware/rate-limit.middleware.ts";
import { route } from "../../common/http/route.ts";
import { authController } from "./auth.controller.ts";

const router = Router();

router.post("/register", authRateLimiter, route(authController, "register"));
router.post("/login", authRateLimiter, route(authController, "login"));
router.get("/me", authMiddleware, route(authController, "me"));
router.post("/refresh", authRateLimiter, route(authController, "refreshToken"));
router.post("/logout", route(authController, "logout"));

export default router;
