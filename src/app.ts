import express from "express";
import routes from "./routes/index.ts";
import { errorMiddleware } from "./common/middleware/error.middleware.ts";

const app = express();

app.use(express.json());

app.use(routes);

app.use(errorMiddleware);

export default app;
