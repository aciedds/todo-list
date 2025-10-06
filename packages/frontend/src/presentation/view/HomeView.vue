
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTodoStore } from '../stores/todo_store'
import { useAuthStore } from '../stores/auth_store'
import type { CreateTodoData, TodoFilters } from '../../data/models/request/todo_request'
const todoStore = useTodoStore()
const authStore = useAuthStore()

// Reactive state
const isLoading = computed(() => todoStore.isLoading)
const todos = computed(() => todoStore.todos)
const selectedTodos = computed(() => todoStore.selectedTodos)
const hasSelectedTodos = computed(() => todoStore.hasSelectedTodos)

// New todo form
const newTodo = ref<CreateTodoData>({
  title: '',
  content: ''
})

// Filters and search
const searchQuery = ref('')
const selectedFilter = ref('all')
const sortBy = ref('createdAt')

// Computed properties
const userInitials = computed(() => {
  const name = authStore.user?.name || 'User'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const totalTodos = computed(() => todos.value.length)
const completedTodosCount = computed(() => todoStore.completedTodos.length)
const pendingTodosCount = computed(() => todoStore.pendingTodos.length)
const completionPercentage = computed(() => todoStore.completionPercentage)

const filteredTodos = computed(() => {
  let filtered = todos.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(todo => 
      todo.title.toLowerCase().includes(query) ||
      (todo.content || '').toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (selectedFilter.value === 'pending') {
    filtered = filtered.filter(todo => !todo.completed)
  } else if (selectedFilter.value === 'completed') {
    filtered = filtered.filter(todo => todo.completed)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'updatedAt':
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      case 'createdAt':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    }
  })

  return filtered
})

// Methods
const handleAddTodo = async () => {
  if (!newTodo.value.title.trim()) return

  try {
    await todoStore.addTodo(newTodo.value)
    newTodo.value = {
      title: '',
      content: ''
    }
  } catch (error) {
    console.error('Failed to add todo:', error)
  }
}

const handleToggleComplete = async (id: string) => {
  try {
    await todoStore.toggleTodoComplete(id)
  } catch (error) {
    console.error('Failed to toggle todo:', error)
  }
}

const handleDeleteTodo = async (id: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await todoStore.deleteTodo(id)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }
}

const handleSelectTodo = (id: string) => {
  todoStore.toggleTodoSelection(id)
}

const handleBulkComplete = async () => {
  try {
    // Complete todos individually since bulk operations are not available
    for (const todoId of selectedTodos.value) {
      await todoStore.toggleTodoComplete(todoId)
    }
  } catch (error) {
    console.error('Failed to complete todos:', error)
  }
}

const handleBulkDelete = async () => {
  if (confirm(`Are you sure you want to delete ${selectedTodos.value.length} tasks?`)) {
    try {
      // Delete todos individually since bulk operations are not available
      for (const todoId of selectedTodos.value) {
        await todoStore.deleteTodo(todoId)
      }
    } catch (error) {
      console.error('Failed to delete todos:', error)
    }
  }
}

const handleEditTodo = (id: string) => {
  // Navigate to edit page or open modal
  console.log('Edit todo:', id)
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleFilterChange = () => {
  // Filter is handled by computed property
}

const handleSortChange = () => {
  // Sort is handled by computed property
}

const handleLogout = async () => {
  try {
    await authStore.handleLogout()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  try {
    await todoStore.fetchTodos()
  } catch (error) {
    console.error('Failed to fetch todos:', error)
  }
})

// Watch for changes in filters to update store
watch([searchQuery, selectedFilter, sortBy], () => {
  const filters: TodoFilters = {
    search: searchQuery.value || undefined,
    completed: selectedFilter.value === 'all' ? undefined : selectedFilter.value === 'completed',
    sortBy: sortBy.value as any,
    sortOrder: 'desc'
  }
  
  todoStore.setFilters(filters)
})
</script>

<template>
  <div class="home-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <div class="logo-icon">📝</div>
            <h1 class="logo-text">TodoApp</h1>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <div class="user-avatar">
              {{ userInitials }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ authStore.user?.email || 'User' }}</span>
              <span class="user-email">{{ authStore.user?.email }}</span>
            </div>
          </div>
          <button @click="handleLogout" class="logout-button">
            <span class="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <!-- Welcome Section -->
        <section class="welcome-section">
          <h2 class="welcome-title">
            Welcome back, {{ authStore.user?.name || 'User' }}! 👋
          </h2>
          <p class="welcome-subtitle">
            Let's get things done today. You have {{ pendingTodosCount }} pending tasks.
          </p>
        </section>

        <!-- Stats Cards -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-number">{{ totalTodos }}</div>
                <div class="stat-label">Total Tasks</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-number">{{ completedTodosCount }}</div>
                <div class="stat-label">Completed</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏳</div>
              <div class="stat-content">
                <div class="stat-number">{{ pendingTodosCount }}</div>
                <div class="stat-label">Pending</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-number">{{ completionPercentage }}%</div>
                <div class="stat-label">Progress</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Add Todo Form -->
        <section class="add-todo-section">
          <div class="add-todo-card">
            <h3 class="add-todo-title">Add New Task</h3>
            <form @submit.prevent="handleAddTodo" class="add-todo-form">
              <div class="form-row">
                <div class="input-group">
                  <input
                    v-model="newTodo.title"
                    type="text"
                    placeholder="What needs to be done?"
                    class="todo-input"
                    required
                    @keydown.enter="handleAddTodo"
                  />
                </div>
                <button type="submit" class="add-button" :disabled="isLoading">
                  <span v-if="isLoading" class="loading-spinner"></span>
                  <span v-else class="add-icon">➕</span>
                  Add Task
                </button>
              </div>
              <div class="form-row">
                <div class="input-group full-width">
                  <textarea
                    v-model="newTodo.content"
                    placeholder="Add a description (optional)"
                    class="description-input"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
        </section>

        <!-- Filters and Search -->
        <section class="filters-section">
          <div class="filters-card">
            <div class="filters-row">
              <div class="search-group">
                <div class="search-input-wrapper">
                  <span class="search-icon">🔍</span>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search tasks..."
                    class="search-input"
                    @input="handleSearch"
                  />
                </div>
              </div>
              <div class="filter-group">
                <select v-model="selectedFilter" @change="handleFilterChange" class="filter-select">
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div class="sort-group">
                <select v-model="sortBy" @change="handleSortChange" class="sort-select">
                  <option value="createdAt">Date Created</option>
                  <option value="updatedAt">Last Updated</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- Todo List -->
        <section class="todos-section">
          <div class="todos-header">
            <h3 class="todos-title">Your Tasks</h3>
            <div class="todos-actions">
              <button 
                v-if="hasSelectedTodos" 
                @click="handleBulkComplete" 
                class="bulk-action-button"
                :disabled="isLoading"
              >
                <span class="bulk-icon">✅</span>
                Mark Complete
              </button>
              <button 
                v-if="hasSelectedTodos" 
                @click="handleBulkDelete" 
                class="bulk-action-button delete"
                :disabled="isLoading"
              >
                <span class="bulk-icon">🗑️</span>
                Delete
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner large"></div>
            <p>Loading your tasks...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredTodos.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h4>No tasks found</h4>
            <p v-if="searchQuery">Try adjusting your search terms</p>
            <p v-else>Add your first task to get started!</p>
          </div>

          <!-- Todo List -->
          <div v-else class="todos-list">
            <div 
              v-for="todo in filteredTodos" 
              :key="todo.id"
              class="todo-item"
              :class="{ 
                completed: todo.completed,
                selected: selectedTodos.includes(todo.id)
              }"
            >
              <div class="todo-checkbox">
                <input
                  type="checkbox"
                  :checked="todo.completed"
                  @change="handleToggleComplete(todo.id)"
                  class="todo-checkbox-input"
                />
              </div>
              <div class="todo-content">
                <div class="todo-header">
                  <h4 class="todo-title" :class="{ completed: todo.completed }">
                    {{ todo.title }}
                  </h4>
                </div>
                <p v-if="todo.content" class="todo-description">
                  {{ todo.content }}
                </p>
                <div class="todo-meta">
                  <span class="todo-date">
                    {{ formatDate(todo.createdAt || new Date()) }}
                  </span>
                </div>
              </div>
              <div class="todo-actions">
                <button 
                  @click="handleSelectTodo(todo.id)"
                  class="action-button select"
                  :class="{ selected: selectedTodos.includes(todo.id) }"
                >
                  {{ selectedTodos.includes(todo.id) ? '✓' : '○' }}
                </button>
                <button @click="handleEditTodo(todo.id)" class="action-button edit">
                  ✏️
                </button>
                <button @click="handleDeleteTodo(todo.id)" class="action-button delete">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Error Banner -->
    <div v-if="todoStore.error" class="error-banner">
      <span class="error-icon">⚠️</span>
      {{ todoStore.error }}
      <button @click="todoStore.clearError()" class="error-close">×</button>
    </div>
  </div>
</template>


<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.app-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.user-email {
  color: #6b7280;
  font-size: 0.75rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.main-content {
  padding: 2rem 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.welcome-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.add-todo-section {
  margin-bottom: 2rem;
}

.add-todo-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.add-todo-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.add-todo-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.input-group {
  flex: 1;
}

.input-group.full-width {
  flex: 1;
}

.todo-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.todo-input:focus {
  outline: none;
  border-color: #667eea;
}

.priority-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.description-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 60px;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters-section {
  margin-bottom: 2rem;
}

.filters-card {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-group {
  flex: 2;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-group,
.sort-group {
  flex: 1;
}

.filter-select,
.sort-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.todos-section {
  margin-bottom: 2rem;
}

.todos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.todos-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.todos-actions {
  display: flex;
  gap: 0.5rem;
}

.bulk-action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bulk-action-button:not(.delete) {
  background: #10b981;
  color: white;
}

.bulk-action-button.delete {
  background: #ef4444;
  color: white;
}

.bulk-action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.bulk-action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-spinner.large {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todo-item {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.todo-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.todo-item.selected {
  border-color: #667eea;
  background: #f8faff;
}

.todo-item.completed {
  opacity: 0.7;
}

.todo-checkbox {
  margin-top: 0.25rem;
}

.todo-checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-content {
  flex: 1;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.todo-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  transition: all 0.3s ease;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-priority {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.todo-priority.high {
  background: #fef2f2;
  color: #dc2626;
}

.todo-priority.medium {
  background: #fffbeb;
  color: #d97706;
}

.todo-priority.low {
  background: #f0fdf4;
  color: #059669;
}

.todo-description {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.todo-meta {
  font-size: 0.875rem;
  color: #9ca3af;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.action-button.select {
  background: #f3f4f6;
  color: #6b7280;
}

.action-button.select.selected {
  background: #667eea;
  color: white;
}

.action-button.edit {
  background: #fef3c7;
  color: #d97706;
}

.action-button.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-button:hover {
  transform: scale(1.1);
}

.error-banner {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.error-icon {
  font-size: 1.25rem;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.5rem;
  margin-left: 0.5rem;
  padding: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }

  .content-container {
    padding: 0 1rem;
  }

  .form-row {
    flex-direction: column;
  }

  .filters-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .todos-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .todo-item {
    padding: 1rem;
  }

  .todo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .todo-actions {
    flex-wrap: wrap;
  }
}
</style>