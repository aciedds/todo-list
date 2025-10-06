import type { TodoFilters } from "../../../data/models/request/todo_request";
import type { Todo } from "../../models/todo_model";
import type { TodoRepository } from "../../repositories/todo_repository";

export class GetTodosUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(filters?: TodoFilters): Promise<Todo[]> {
    return this.todoRepository.getAll(filters);
  }
}