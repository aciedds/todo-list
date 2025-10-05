import { Elysia, t } from "elysia";
import { todoUseCase } from "../../di/injections";
import { handleError } from "../../utils/handler_error";
import { authPlugin } from "../../utils/middleware/auth_middleware";

export const todoRoutes = (app: Elysia) =>
  app
    .use(authPlugin)
    .group("/todos", (app) =>
      app
        .post(
          "/",
          async ({ body, currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const todoData = {
                ...body,
                authorId: currentUser.id
              };
              const todo = await todoUseCase.createTodo(todoData, currentUser.id);
              set.status = 201;
              return {
                success: true,
                message: "Todo created successfully",
                data: todo
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            body: t.Object({
              title: t.String({ minLength: 1, maxLength: 255 }),
              content: t.Optional(t.String({ maxLength: 1000 })),
              completed: t.Optional(t.Boolean()),
            }),
            detail: {
              summary: "Create a new todo",
              description: "Create a new todo item for the authenticated user",
              tags: ["Todos"]
            }
          }
        )
        .get(
          "/",
          async ({ currentUser, set }) => {
            try {
              if (!currentUser) {
                set.status = 401;
                return { error: "Authentication required" };
              }

              const todos = await todoUseCase.getTodos(currentUser.id);
              set.status = 200;
              return {
                success: true,
                data: todos
              };
            } catch (error) {
              return handleError(error);
            }
          },
          {
            detail: {
              summary: "Get all todos",
              description: "Get all todo items for the authenticated user",
              tags: ["Todos"]
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

              const todo = await todoUseCase.getTodoById(params.id, currentUser.id);
              set.status = 200;
              return {
                success: true,
                data: todo
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
              summary: "Get todo by ID",
              description: "Get a specific todo item by ID for the authenticated user",
              tags: ["Todos"]
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

              const todo = await todoUseCase.updateTodo(params.id, body, currentUser.id);
              set.status = 200;
              return {
                success: true,
                message: "Todo updated successfully",
                data: todo
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
              title: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
              content: t.Optional(t.String({ maxLength: 1000 })),
              completed: t.Optional(t.Boolean()),
            }),
            detail: {
              summary: "Update todo",
              description: "Update a specific todo item for the authenticated user",
              tags: ["Todos"]
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

              const todo = await todoUseCase.deleteTodo(params.id, currentUser.id);
              set.status = 200;
              return {
                success: true,
                message: "Todo deleted successfully",
                data: todo
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
              summary: "Delete todo",
              description: "Delete a specific todo item for the authenticated user",
              tags: ["Todos"]
            }
          }
        )
    );