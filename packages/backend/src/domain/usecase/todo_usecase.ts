
import type { TodoRepository } from "../repository/todo_repository";
import { NotFoundError } from "../../utils/error_utils/not_found_error";
import type { Prisma } from "../../../prisma/generated";


export class TodoUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async createTodo(data: Prisma.TodoUncheckedCreateInput, userId: string) {
    // Ensure the todo is created with the correct author
    const todoData = {
      ...data,
      authorId: userId
    };
    return this.todoRepository.createTodo(todoData);
  }

  async getTodos(userId: string) {
    return this.todoRepository.getTodos(userId);
  }

  async getTodoById(id: string, userId: string) {
    const todo = await this.todoRepository.getTodoById(id, userId);
    if (!todo) {
      throw new NotFoundError('Todo not found or you do not have permission to view this todo.');
    }
    return todo;
  }

  async updateTodo(id: string, data: Prisma.TodoUpdateInput, userId: string) {
    // First check if the todo exists and belongs to the user
    const existingTodo = await this.todoRepository.getTodoByIdForOwner(id, userId);
    if (!existingTodo) {
      throw new NotFoundError('Todo not found or you do not have permission to update this todo.');
    }

    return this.todoRepository.updateTodo(id, data, userId);
  }

  async deleteTodo(id: string, userId: string) {
    // First check if the todo exists and belongs to the user
    const existingTodo = await this.todoRepository.getTodoByIdForOwner(id, userId);
    if (!existingTodo) {
      throw new NotFoundError('Todo not found or you do not have permission to delete this todo.');
    }

    return this.todoRepository.deleteTodo(id, userId);
  }
}