import { Router } from "express";
import { route } from "../../common/http/route.ts";
import { healthController } from "./health.controller.ts";

const router = Router();

router.get("/", route(healthController, "liveness"));
router.get("/ready", route(healthController, "readiness"));

export default router;
