import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { PrismaClient } from "./generated/prisma/client";


const prisma = new PrismaClient();

const app = new Elysia();

app
  .use(cors())
  .get("/health", () => {
    console.log("health check is running..");
    return {
      status: "ok",
    };
  })
  .get("/todos", async () => {
    const todos = await prisma.todo.findMany();
    return todos;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
