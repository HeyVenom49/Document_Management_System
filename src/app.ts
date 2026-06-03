import express from "express";
import { errorMiddleware } from "./common/middleware/error.middleware.ts";
import routes from "./routes/index.ts";

const app = express();

app.use(express.json());

app.use(routes);

app.use(errorMiddleware);

export default app;
