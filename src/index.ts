import "./alias-setup";
import { FastifyServer } from "@/infrastructure/http/FastifyServer";

async function main() {
  console.log("Starting application...");
  try {
    console.log("Creating FastifyServer instance...");
    const server = new FastifyServer();
    console.log("FastifyServer instance created successfully");

    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      try {
        await server.stop();
        console.log("Server stopped gracefully");
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    const port = parseInt(process.env.PORT || "3000", 10);
    const host = process.env.HOST || "0.0.0.0";

    console.log(`Starting server on ${host}:${port}...`);
    await server.start(port, host);
    console.log("Server started successfully and is listening...");

    console.log("Server is running. Press Ctrl+C to stop.");
    process.on("exit", (code) => {
      console.log(`Process is exiting with code: ${code}`);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      process.exit(1);
    });
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
