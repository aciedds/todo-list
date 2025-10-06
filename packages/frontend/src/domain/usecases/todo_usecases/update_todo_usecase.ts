import type { TodoRepository } from "../../repositories/todo_repository";
import type { UpdateTodoData } from "../../../data/models/request/todo_request";
import type { Todo } from "../../models/todo_model";

export class UpdateTodoUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(id: string, data: UpdateTodoData): Promise<Todo> {
    return this.todoRepository.update(id, data);
  }
}
