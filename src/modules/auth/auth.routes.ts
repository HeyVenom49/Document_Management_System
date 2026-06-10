import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/me", authMiddleware, authController.me.bind(authController));
router.post(
  "/refresh",
  authMiddleware,
  authController.refreshToken.bind(authController),
);

export default router;
