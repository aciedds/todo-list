import type { TodoRepository } from "../../repositories/todo_repository";
import type { Todo } from "../../models/todo_model";

export class ToggleTodoUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(id: string, currentCompleted: boolean): Promise<Todo> {
    return this.todoRepository.update(id, { completed: !currentCompleted });
  }
}
