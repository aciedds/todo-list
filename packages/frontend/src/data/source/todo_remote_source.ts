
import { ApiClient } from '../services/api_service';
import type { Todo } from '../../domain/models/todo_model';
import type { ApiError } from '../services/api_service';
import type {
  CreateTodoData,
  TodoFilters,
  UpdateTodoData,
} from '../models/request/todo_request';
import type { CreateTodoResponse, DeleteTodoResponse, GetTodoResponse, GetTodosResponse, UpdateTodoResponse } from '../models/response/todo_response';

export class TodoDataSource {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get all todos with optional filtering and sorting
   */
  async getAll(filters?: TodoFilters): Promise<Todo[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.completed !== undefined) {
        params.append('completed', filters.completed.toString());
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters?.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }

      const queryString = params.toString();
      const url = queryString ? `/todos?${queryString}` : '/todos';

      const response = await this.apiClient.get<GetTodosResponse>(url);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single todo by ID
   */
  async getById(id: string): Promise<Todo> {
    try {
      this.validateId(id);
      const response = await this.apiClient.get<GetTodoResponse>(`/todos/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new todo
   */
  async create(data: CreateTodoData): Promise<Todo> {
    try {
      this.validateCreateData(data);
      const response = await this.apiClient.post<CreateTodoResponse>('/todos', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing todo
   */
  async update(id: string, data: UpdateTodoData): Promise<Todo> {
    try {
      this.validateId(id);
      this.validateUpdateData(data);
      const response = await this.apiClient.put<UpdateTodoResponse>(`/todos/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }


  /**
   * Delete a todo
   */
  async delete(id: string): Promise<void> {
    try {
      this.validateId(id);
      await this.apiClient.delete<DeleteTodoResponse>(`/todos/${id}`);
    } catch (error) {
      console.error(`Failed to delete todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }


  // Private validation methods
  private validateId(id: string): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('Valid ID is required');
    }
  }

  private validateCreateData(data: CreateTodoData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Todo data is required');
    }

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Title is required and must be a non-empty string');
    }

    if (data.title.length > 255) {
      throw new Error('Title must be 255 characters or less');
    }

    if (data.content && data.content.length > 1000) {
      throw new Error('Content must be 1000 characters or less');
    }

    if (data.completed !== undefined && typeof data.completed !== 'boolean') {
      throw new Error('Completed must be a boolean value');
    }
  }

  private validateUpdateData(data: UpdateTodoData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Update data is required');
    }

    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim().length === 0) {
        throw new Error('Title must be a non-empty string');
      }
      if (data.title.length > 255) {
        throw new Error('Title must be 255 characters or less');
      }
    }

    if (data.content !== undefined && data.content.length > 1000) {
      throw new Error('Content must be 1000 characters or less');
    }

    if (data.completed !== undefined && typeof data.completed !== 'boolean') {
      throw new Error('Completed must be a boolean value');
    }
  }

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