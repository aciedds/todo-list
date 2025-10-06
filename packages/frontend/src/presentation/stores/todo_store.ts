import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Todo } from '../../domain/models/todo_model';
import { TodoRepositoryImpl } from '../../data/repositories/todo_repository';
import { TodoDataSource } from '../../data/source/todo_remote_source';
import apiClient from '../../data/services/api_service';
import type {
  CreateTodoData,
  UpdateTodoData,
  TodoFilters
} from '../../data/models/request/todo_request';
import type { ApiError } from '../../data/services/api_service';

// Inisialisasi dependensi
const todoDataSource = new TodoDataSource(apiClient);
const todoRepository = new TodoRepositoryImpl(todoDataSource);

export const useTodoStore = defineStore('todo', () => {
  // State
  const todos = ref<Todo[]>([]);
  const currentTodo = ref<Todo | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const filters = ref<TodoFilters>({});
  const selectedTodos = ref<string[]>([]);

  // Computed
  const completedTodos = computed(() =>
    todos.value.filter(todo => todo.completed)
  );

  const pendingTodos = computed(() =>
    todos.value.filter(todo => !todo.completed)
  );

  const todosByPriority = computed(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...todos.value].sort((a, b) => {
      const aPriority = (a as any).priority || 'low';
      const bPriority = (b as any).priority || 'low';
      return priorityOrder[bPriority as keyof typeof priorityOrder] - priorityOrder[aPriority as keyof typeof priorityOrder];
    });
  });

  const filteredTodos = computed(() => {
    let filtered = todos.value;

    if (filters.value.completed !== undefined) {
      filtered = filtered.filter(todo => todo.completed === filters.value.completed);
    }

    if (filters.value.priority) {
      filtered = filtered.filter(todo => (todo as any).priority === filters.value.priority);
    }

    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm) ||
        ((todo as any).description || '').toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  });

  const hasSelectedTodos = computed(() => selectedTodos.value.length > 0);

  const completionPercentage = computed(() => {
    if (todos.value.length === 0) return 0;
    return Math.round((completedTodos.value.length / todos.value.length) * 100);
  });

  // Actions
  async function fetchTodos(customFilters?: TodoFilters) {
    try {
      isLoading.value = true;
      error.value = null;

      const filtersToUse = customFilters || filters.value;
      todos.value = await todoRepository.getAll(filtersToUse);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to fetch todos';
      console.error('Failed to fetch todos:', err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function getTodoById(id: string) {
    try {
      isLoading.value = true;
      error.value = null;

      currentTodo.value = await todoRepository.getById(id);
      return currentTodo.value;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to fetch todo';
      console.error(`Failed to fetch todo with id ${id}:`, err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function addTodo(data: CreateTodoData) {
    try {
      isLoading.value = true;
      error.value = null;

      const newTodo = await todoRepository.create(data);
      todos.value.unshift(newTodo); // Add to beginning of list

      return newTodo;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to create todo';
      console.error('Failed to create todo:', err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTodo(id: string, data: UpdateTodoData) {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedTodo = await todoRepository.update(id, data);
      const index = todos.value.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
      }

      if (currentTodo.value?.id === id) {
        currentTodo.value = updatedTodo;
      }

      return updatedTodo;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to update todo';
      console.error(`Failed to update todo with id ${id}:`, err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function patchTodo(id: string, data: Partial<UpdateTodoData>) {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedTodo = await todoRepository.patch(id, data);
      const index = todos.value.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
      }

      if (currentTodo.value?.id === id) {
        currentTodo.value = updatedTodo;
      }

      return updatedTodo;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to update todo';
      console.error(`Failed to patch todo with id ${id}:`, err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteTodo(id: string) {
    try {
      isLoading.value = true;
      error.value = null;

      await todoRepository.delete(id);
      todos.value = todos.value.filter(todo => todo.id !== id);
      selectedTodos.value = selectedTodos.value.filter(todoId => todoId !== id);

      if (currentTodo.value?.id === id) {
        currentTodo.value = null;
      }
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to delete todo';
      console.error(`Failed to delete todo with id ${id}:`, err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleTodoComplete(id: string) {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedTodo = await todoRepository.toggleComplete(id);
      const index = todos.value.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
      }

      if (currentTodo.value?.id === id) {
        currentTodo.value = updatedTodo;
      }

      return updatedTodo;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to toggle todo';
      console.error(`Failed to toggle todo with id ${id}:`, err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function markMultipleComplete(ids: string[]) {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedTodos = await todoRepository.markMultipleComplete(ids);

      // Update todos in the list
      updatedTodos.forEach(updatedTodo => {
        const index = todos.value.findIndex(todo => todo.id === updatedTodo.id);
        if (index !== -1) {
          todos.value[index] = updatedTodo;
        }
      });

      // Clear selection
      selectedTodos.value = [];

      return updatedTodos;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to mark todos as complete';
      console.error('Failed to mark multiple todos as complete:', err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteMultipleTodos(ids: string[]) {
    try {
      isLoading.value = true;
      error.value = null;

      await todoRepository.deleteMultiple(ids);
      todos.value = todos.value.filter(todo => !ids.includes(todo.id));
      selectedTodos.value = [];
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to delete todos';
      console.error('Failed to delete multiple todos:', err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  function setFilters(newFilters: TodoFilters) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function clearFilters() {
    filters.value = {};
  }

  function selectTodo(id: string) {
    if (!selectedTodos.value.includes(id)) {
      selectedTodos.value.push(id);
    }
  }

  function deselectTodo(id: string) {
    selectedTodos.value = selectedTodos.value.filter(todoId => todoId !== id);
  }

  function toggleTodoSelection(id: string) {
    if (selectedTodos.value.includes(id)) {
      deselectTodo(id);
    } else {
      selectTodo(id);
    }
  }

  function selectAllTodos() {
    selectedTodos.value = todos.value.map(todo => todo.id);
  }

  function clearSelection() {
    selectedTodos.value = [];
  }

  function clearError() {
    error.value = null;
  }

  function clearCurrentTodo() {
    currentTodo.value = null;
  }

  return {
    // State
    todos,
    currentTodo,
    isLoading,
    error,
    filters,
    selectedTodos,

    // Computed
    completedTodos,
    pendingTodos,
    todosByPriority,
    filteredTodos,
    hasSelectedTodos,
    completionPercentage,

    // Actions
    fetchTodos,
    getTodoById,
    addTodo,
    updateTodo,
    patchTodo,
    deleteTodo,
    toggleTodoComplete,
    markMultipleComplete,
    deleteMultipleTodos,
    setFilters,
    clearFilters,
    selectTodo,
    deselectTodo,
    toggleTodoSelection,
    selectAllTodos,
    clearSelection,
    clearError,
    clearCurrentTodo
  };
});