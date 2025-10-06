import type { Todo } from "../../domain/models/todo_model";
import type { TodoRepository } from "../../domain/repositories/todo_repository";
import type { TodoDataSource } from "../source/todo_remote_source";
import type { ApiError } from "../services/api_service";
import type { CreateTodoData, TodoFilters, UpdateTodoData } from "../models/request/todo_request";

export class TodoRepositoryImpl implements TodoRepository {
  private todoDataSource: TodoDataSource;

  constructor(todoDataSource: TodoDataSource) {
    this.todoDataSource = todoDataSource;
  }

  /**
   * Get all todos with optional filtering and sorting
   */
  async getAll(filters?: TodoFilters): Promise<Todo[]> {
    try {
      return await this.todoDataSource.getAll(filters);
    } catch (error) {
      console.error('Repository: Failed to get all todos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single todo by ID
   */
  async getById(id: string): Promise<Todo> {
    try {
      return await this.todoDataSource.getById(id);
    } catch (error) {
      console.error(`Repository: Failed to get todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new todo
   */
  async create(data: CreateTodoData): Promise<Todo> {
    try {
      return await this.todoDataSource.create(data);
    } catch (error) {
      console.error('Repository: Failed to create todo:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing todo
   */
  async update(id: string, data: UpdateTodoData): Promise<Todo> {
    try {
      return await this.todoDataSource.update(id, data);
    } catch (error) {
      console.error(`Repository: Failed to update todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }


  /**
   * Delete a todo
   */
  async delete(id: string): Promise<void> {
    try {
      await this.todoDataSource.delete(id);
    } catch (error) {
      console.error(`Repository: Failed to delete todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }


  /**
   * Handle errors from the data source
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        code: error.response.data?.code,
      };
    } else if (error.request) {
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}