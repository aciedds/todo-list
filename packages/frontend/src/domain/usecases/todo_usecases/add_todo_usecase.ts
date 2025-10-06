import type { TodoRepository } from "../../repositories/todo_repository";
import type { CreateTodoData } from "../../../data/models/request/todo_request";
import type { Todo } from "../../models/todo_model";

export class AddTodoUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(data: CreateTodoData): Promise<Todo> {
    return this.todoRepository.create(data);
  }
}