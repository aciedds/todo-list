import type { TodoRepository } from "../../repositories/todo_repository";

export class GetTodosUseCase {
  private todoRepository: TodoRepository;
  
  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute() {
    return this.todoRepository.getAll();
  }
}