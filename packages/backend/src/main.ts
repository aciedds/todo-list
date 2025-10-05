import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { userRoutes } from "./presentation/routes/user_routes";
import { todoRoutes } from "./presentation/routes/todo_routes";
import { prisma } from "./di/injections";

// Environment configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

// Validate required environment variables
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is required");
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const app = new Elysia();

app
  .use(cors())
  .get("/health", () => {
    console.log("health check is running..");
    return {
      status: "ok",
    };
  })
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
