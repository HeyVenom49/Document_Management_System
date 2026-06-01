import app from "./app.ts";
import { connectDB } from "./database/index.ts";

const port = process.env.PORT;

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
