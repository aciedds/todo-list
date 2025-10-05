
import type { Prisma , Todo} from "../../../prisma/generated";
import type { TodoRepository } from "../../domain/repository/todo_repository";
import type { TodoDataSource } from "../source/prisma_todo";

export class TodoRepositoryImpl implements TodoRepository {
  private dataSource: TodoDataSource;
  constructor(dataSource: TodoDataSource) {
    this.dataSource = dataSource;
  }
  async updateTodo(id: string, data: Prisma.TodoUpdateInput, userId: string): Promise<Todo> {
    return this.dataSource.update(id, data, userId);
  }

  async deleteTodo(id: string, userId: string): Promise<Todo> {
    return this.dataSource.delete(id, userId);
  }

  async createTodo(data: Prisma.TodoUncheckedCreateInput): Promise<Todo> {
    return this.dataSource.create(data);
  }

  async getTodos(userId: string): Promise<Todo[]> {
    return this.dataSource.findAll(userId);
  }

  async getTodoById(id: string, userId: string): Promise<Todo | null> {
    return this.dataSource.findById(id, userId);
  }

  async getTodoByIdForOwner(id: string, userId: string): Promise<Todo | null> {
    return this.dataSource.findByIdForOwner(id, userId);
  }

}
