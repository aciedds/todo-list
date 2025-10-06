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

// Database connection test
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log("\n🛑 Graceful shutdown initiated...");
  try {
    await prisma.$disconnect();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle process signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

const app = new Elysia({
  name: "todo-list-api",
})
  // Global error handler
  .onError(({ error, set }) => {
    console.error("❌ Server Error:", error);
    set.status = 500;
    return {
      success: false,
      error: NODE_ENV === "production"
        ? "Internal server error"
        : (error instanceof Error ? error.message : "Unknown error occurred")
    };
  })
  // CORS configuration
  .use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Bearer"]
  }))
  // Health check endpoint
  .get("/health", async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        database: "connected"
      };
    } catch (error) {
      return {
        success: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  })
  // Root endpoint
  .get("/", () => ({
    success: true,
    message: "Todo List API is running",
    version: "1.0.0",
    environment: NODE_ENV,
    documentation: "/swagger",
    health: "/health",
    endpoints: {
      users: "/users",
      todos: "/todos"
    }
  }))
  // Swagger documentation
  .use(swagger())
  // API routes
  .use(userRoutes)
  .use(todoRoutes)
  // 404 handler
  .all("*", () => ({
    success: false,
    error: "Endpoint not found",
    message: "The requested endpoint does not exist"
  }));

// Start server
async function startServer() {
  try {
    // Test database connection first
    await testDatabaseConnection();

    // Start the server
    await app.listen(PORT);

    console.log(`
🚀 Todo List API Server Started Successfully!

📊 Server Information:
   • Environment: ${NODE_ENV}
   • Port: ${PORT}
   • URL: http://localhost:${PORT}
   • Documentation: http://localhost:${PORT}/swagger
   • Health Check: http://localhost:${PORT}/health

🔗 Available Endpoints:
   • Users: http://localhost:${PORT}/users
   • Todos: http://localhost:${PORT}/todos

🛡️  Security Features:
   • JWT Authentication
   • CORS Protection
   • Input Validation
   • User Authorization
   • Password Hashing

📚 API Documentation available at: http://localhost:${PORT}/swagger
    `);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the application
startServer();
