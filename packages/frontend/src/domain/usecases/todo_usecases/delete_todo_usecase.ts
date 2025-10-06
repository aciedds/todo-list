import type { TodoRepository } from "../../repositories/todo_repository";

export class DeleteTodoUseCase {
  private todoRepository: TodoRepository;
  
  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(id: string) {
    return this.todoRepository.delete(id);
  }
}