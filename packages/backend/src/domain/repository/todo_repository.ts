import type { Prisma, Todo } from "../../../prisma/generated";

export interface TodoRepository {
  createTodo(data: Prisma.TodoUncheckedCreateInput): Promise<Todo>;
  getTodos(userId: string): Promise<Todo[]>;
  getTodoById(id: string, userId: string): Promise<Todo | null>;
  updateTodo(id: string, data: Prisma.TodoUpdateInput, userId: string): Promise<Todo>;
  deleteTodo(id: string, userId: string): Promise<Todo>;
  getTodoByIdForOwner(id: string, userId: string): Promise<Todo | null>;
}
