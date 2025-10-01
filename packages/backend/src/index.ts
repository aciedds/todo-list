import cors from "@elysiajs/cors";
import { Elysia } from "elysia";

const app = new Elysia();

app
  .use(cors())
  .get("/health", () => {
    console.log("health check is running..");
    return {
      status: "ok",
    };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
