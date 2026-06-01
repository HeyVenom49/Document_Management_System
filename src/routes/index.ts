import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.ts";

const router = Router();

router.post("/auth", authRoutes);

export default router;
