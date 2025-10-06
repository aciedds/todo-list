import type { CreateTodoData, TodoFilters, UpdateTodoData } from "../../data/models/request/todo_request";
import type { Todo } from "../models/todo_model";


export interface TodoRepository {
  getAll(filters?: TodoFilters): Promise<Todo[]>;
  getById(id: string): Promise<Todo>;
  create(data: CreateTodoData): Promise<Todo>;
  update(id: string, data: UpdateTodoData): Promise<Todo>;
  patch(id: string, data: Partial<UpdateTodoData>): Promise<Todo>;
  delete(id: string): Promise<void>;
  toggleComplete(id: string): Promise<Todo>;
  markMultipleComplete(ids: string[]): Promise<Todo[]>;
  deleteMultiple(ids: string[]): Promise<void>;
}