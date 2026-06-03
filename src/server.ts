import "./config/env.ts";
import app from "./app.ts";
import { connectDB } from "./database/index.ts";

const port = Number(process.env.PORT) || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(port, (): void => {
    console.log(
      `Server is running on the port ${port} in ${process.env.ENVIRONMENT}`,
    );
  });
};

startServer().catch((err) => {
  console.log(`Failed to start the server ${err}`);
});
