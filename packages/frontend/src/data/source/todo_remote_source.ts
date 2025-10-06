
import { ApiClient } from '../services/api_service';
import type { Todo } from '../../domain/models/todo_model';
import type { ApiError } from '../services/api_service';
import type { CreateTodoData, TodoFilters, UpdateTodoData } from '../models/request/todo_request';

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
      if (filters?.priority) {
        params.append('priority', filters.priority);
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

      const response = await this.apiClient.get<Todo[]>(url);
      return response.data;
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
      const response = await this.apiClient.get<Todo>(`/todos/${id}`);
      return response.data;
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
      const response = await this.apiClient.post<Todo>('/todos', data);
      return response.data;
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
      const response = await this.apiClient.put<Todo>(`/todos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Partially update an existing todo
   */
  async patch(id: string, data: Partial<UpdateTodoData>): Promise<Todo> {
    try {
      this.validateId(id);
      const response = await this.apiClient.patch<Todo>(`/todos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to patch todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a todo
   */
  async delete(id: string): Promise<void> {
    try {
      this.validateId(id);
      await this.apiClient.delete(`/todos/${id}`);
    } catch (error) {
      console.error(`Failed to delete todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Toggle todo completion status
   */
  async toggleComplete(id: string): Promise<Todo> {
    try {
      this.validateId(id);
      const response = await this.apiClient.patch<Todo>(`/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle todo with id ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark multiple todos as completed
   */
  async markMultipleComplete(ids: string[]): Promise<Todo[]> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('IDs array must be provided and not empty');
      }

      ids.forEach(id => this.validateId(id));

      const response = await this.apiClient.post<Todo[]>('/todos/bulk-complete', { ids });
      return response.data;
    } catch (error) {
      console.error('Failed to mark multiple todos as complete:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete multiple todos
   */
  async deleteMultiple(ids: string[]): Promise<void> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('IDs array must be provided and not empty');
      }

      ids.forEach(id => this.validateId(id));

      await this.apiClient.post('/todos/bulk-delete', { ids });
    } catch (error) {
      console.error('Failed to delete multiple todos:', error);
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

    if (data.description && data.description.length > 1000) {
      throw new Error('Description must be 1000 characters or less');
    }

    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      throw new Error('Priority must be low, medium, or high');
    }

    if (data.dueDate && !this.isValidDate(data.dueDate)) {
      throw new Error('Due date must be a valid ISO date string');
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

    if (data.description !== undefined && data.description.length > 1000) {
      throw new Error('Description must be 1000 characters or less');
    }

    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      throw new Error('Priority must be low, medium, or high');
    }

    if (data.dueDate && !this.isValidDate(data.dueDate)) {
      throw new Error('Due date must be a valid ISO date string');
    }
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
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