import { Elysia, t } from "elysia";
import { userUseCase } from "../../di/injections";
import { authPlugin } from "../../utils/middleware/auth_middleware";
import { handleError } from "../../utils/handler_error";

export const userRoutes = (app: Elysia) =>
  app
    .group("/users", (app) =>
      app
        .post(
          "/register",
          async ({ body, set }) => {
            try {
              const user = await userUseCase.registerUser(body);
              set.status = 201;
              return {
                success: true,
                message: "User registered successfully",
                data: {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  createdAt: user.createdAt
                }
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            body: t.Object({
              email: t.String({ format: "email", minLength: 5, maxLength: 255 }),
              password: t.String({ minLength: 8, maxLength: 128 }),
              name: t.String({ minLength: 2, maxLength: 100 }),
            }),
            detail: {
              summary: "Register a new user",
              description: "Create a new user account with email, password, and name",
              tags: ["Authentication"]
            }
          }
        )
        .post(
          "/login",
          async ({ body, set }) => {
            try {
              const result = await userUseCase.loginUser(body);
              set.status = 200;
              return {
                success: true,
                message: "Login successful",
                data: result
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            body: t.Object({
              email: t.String({ format: "email" }),
              password: t.String({ minLength: 1 }),
            }),
            detail: {
              summary: "User login",
              description: "Authenticate user with email and password",
              tags: ["Authentication"]
            }
          }
        )
        // Protected routes (authentication required)
        .use(authPlugin)
        .get(
          "/profile",
          async ({ currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const user = await userUseCase.getUserProfile(currentUser.id, currentUser.id);
              set.status = 200;
              return {
                success: true,
                data: user
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            detail: {
              summary: "Get user profile",
              description: "Get current user's profile information",
              tags: ["User Profile"]
            }
          }
        )
        .get(
          "/:id",
          async ({ params, currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const user = await userUseCase.getUserProfile(params.id, currentUser.id);
              set.status = 200;
              return {
                success: true,
                data: user
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            params: t.Object({
              id: t.String({ minLength: 1 })
            }),
            detail: {
              summary: "Get user by ID",
              description: "Get user profile by ID (only own profile)",
              tags: ["User Profile"]
            }
          }
        )
        .put(
          "/:id",
          async ({ params, body, currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const updatedUser = await userUseCase.updateUser(params.id, body, currentUser.id);
              set.status = 200;
              return {
                success: true,
                message: "User updated successfully",
                data: updatedUser
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            params: t.Object({
              id: t.String({ minLength: 1 })
            }),
            body: t.Object({
              email: t.Optional(t.String({ format: "email", minLength: 5, maxLength: 255 })),
              password: t.Optional(t.String({ minLength: 8, maxLength: 128 })),
              name: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
            }),
            detail: {
              summary: "Update user profile",
              description: "Update user profile information (email, password, name)",
              tags: ["User Profile"]
            }
          }
        )
        .put(
          "/:id/password",
          async ({ params, body, currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const result = await userUseCase.updateUserPassword(params.id, body, currentUser.id);
              set.status = 200;
              return {
                success: true,
                message: result.message
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            params: t.Object({
              id: t.String({ minLength: 1 })
            }),
            body: t.Object({
              currentPassword: t.String({ minLength: 1 }),
              password: t.String({ minLength: 8, maxLength: 128 }),
            }),
            detail: {
              summary: "Update user password",
              description: "Update user password with current password verification",
              tags: ["User Profile"]
            }
          }
        )
        .put(
          "/:id/email",
          async ({ params, body, currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const updatedUser = await userUseCase.changeEmail(params.id, body, currentUser.id);
              set.status = 200;
              return {
                success: true,
                message: "Email updated successfully",
                data: updatedUser
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            params: t.Object({
              id: t.String({ minLength: 1 })
            }),
            body: t.Object({
              newEmail: t.String({ format: "email", minLength: 5, maxLength: 255 }),
              currentPassword: t.String({ minLength: 1 }),
            }),
            detail: {
              summary: "Change user email",
              description: "Change user email with current password verification",
              tags: ["User Profile"]
            }
          }
        )
        .delete(
          "/:id",
          async ({ params, currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const result = await userUseCase.deleteUser(params.id, currentUser.id);
              set.status = 200;
              return {
                success: true,
                message: result.message
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            params: t.Object({
              id: t.String({ minLength: 1 })
            }),
            detail: {
              summary: "Delete user account",
              description: "Delete user account and all associated data",
              tags: ["User Profile"]
            }
          }
        )
    );
