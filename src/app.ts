import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import routes from "./routes/index.ts";
import { errorMiddleware } from "./common/middleware/error.middleware.ts";

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use(routes);

app.use(errorMiddleware);

export default app;
