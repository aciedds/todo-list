import { Elysia } from "elysia";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { userUseCase } from "../../di/injections";

export const authPlugin = (app: Elysia) =>
  app
    .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .use(bearer())
    .derive(async ({ bearer, jwt, request }) => {
      if (request.url.endsWith("/health")) {
        return { currentUser: null };
      }

      console.log("bearer", bearer);
      console.log("jwt", jwt);
      if (!bearer) return { currentUser: null };
      const payload = await jwt.verify(bearer);
      if (!payload) return { currentUser: null };
      console.log("payload", payload);

      const user = await userUseCase.getUserById(payload.userId as string);
      return { currentUser: user };
    });
