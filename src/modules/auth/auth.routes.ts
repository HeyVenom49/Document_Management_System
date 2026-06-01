import { Router } from "express";
import { authController } from "./auth.controller.ts";

const router = Router();

router.post("/register", authController.register.bind(authController));

export default router;
