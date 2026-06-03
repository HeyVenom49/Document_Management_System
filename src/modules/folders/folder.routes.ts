import { Router } from "express";
import { authMiddleware } from "../../common/middleware/auth.middleware.ts";
import { folderController } from "./folder.controller.ts";

const router = Router();

router.post(
  "/",
  authMiddleware,
  folderController.createFolder.bind(folderController),
);

router.get(
  "/",
  authMiddleware,
  folderController.getFolder.bind(folderController),
);

export default router;
