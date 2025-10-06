import type { TodoRepository } from "../../repositories/todo_repository";


export class AddTodoUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(data: { title: string }) {
    return this.todoRepository.create(data);
  }
}