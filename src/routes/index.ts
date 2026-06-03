import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.ts";
import folderRoutes from "../modules/folders/folder.routes.ts";
import documentRoutes from "../modules/documents/document.routes.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/folder", folderRoutes);
router.use("/documents", documentRoutes);

export default router;
