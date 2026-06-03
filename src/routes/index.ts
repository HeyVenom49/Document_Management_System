import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.ts";
import folderRoutes from "../modules/folders/folder.routes.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/folder", folderRoutes);

export default router;
