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
import { AddTodoUseCase } from '../../domain/usecases/todo_usecases/add_todo_usecase';
import { GetTodosUseCase } from '../../domain/usecases/todo_usecases/get_todos_usecase';
import { GetTodoUseCase } from '../../domain/usecases/todo_usecases/get_todo_usecase';
import { UpdateTodoUseCase } from '../../domain/usecases/todo_usecases/update_todo_usecase';
import { DeleteTodoUseCase } from '../../domain/usecases/todo_usecases/delete_todo_usecase';
import { ToggleTodoUseCase } from '../../domain/usecases/todo_usecases/toggle_todo_usecase';

// Inisialisasi dependensi
const todoDataSource = new TodoDataSource(apiClient);
const todoRepository = new TodoRepositoryImpl(todoDataSource);
const addTodoUseCase = new AddTodoUseCase(todoRepository);
const getTodosUseCase = new GetTodosUseCase(todoRepository);
const getTodoUseCase = new GetTodoUseCase(todoRepository);
const updateTodoUseCase = new UpdateTodoUseCase(todoRepository);
const deleteTodoUseCase = new DeleteTodoUseCase(todoRepository);
const toggleTodoUseCase = new ToggleTodoUseCase(todoRepository);

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

  const todosByDate = computed(() => {
    return [...todos.value].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  const filteredTodos = computed(() => {
    let filtered = todos.value;

    if (filters.value.completed !== undefined) {
      filtered = filtered.filter(todo => todo.completed === filters.value.completed);
    }

    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm) ||
        (todo.content || '').toLowerCase().includes(searchTerm)
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
      todos.value = await getTodosUseCase.execute(filtersToUse);
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

      currentTodo.value = await getTodoUseCase.execute(id);
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

      const newTodo = await addTodoUseCase.execute(data);
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

      const updatedTodo = await updateTodoUseCase.execute(id, data);
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


  async function deleteTodo(id: string) {
    try {
      isLoading.value = true;
      error.value = null;

      await deleteTodoUseCase.execute(id);
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

      // Find the current todo to get its completion status
      const currentTodo = todos.value.find(todo => todo.id === id);
      if (!currentTodo) {
        throw new Error('Todo not found');
      }

      // Toggle the completion status using use case
      const updatedTodo = await toggleTodoUseCase.execute(id, currentTodo.completed);
      const index = todos.value.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
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
    todosByDate,
    filteredTodos,
    hasSelectedTodos,
    completionPercentage,

    // Actions
    fetchTodos,
    getTodoById,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
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