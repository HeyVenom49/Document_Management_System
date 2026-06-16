import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.ts";
import documentRoutes from "../modules/documents/document.routes.ts";
import folderRoutes from "../modules/folders/folder.routes.ts";
import healthRoutes from "../modules/health/health.routes.ts";
import tagRoutes from "../modules/tags/tags.routes.ts";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/folder", folderRoutes);
router.use("/documents", documentRoutes);
router.use("/tags", tagRoutes);

export default router;
