<script setup lang="ts">
import { useTodoStore } from '@/presentation/stores/todo.store';
import TodoItem from '@/presentation/components/molecules/TodoItem.vue';
import { computed } from 'vue';

const todoStore = useTodoStore();
const todos = computed(() => todoStore.todos);
</script>
<template>
    <div class="w-full mt-4 space-y-3">
        <p v-if="todoStore.isLoading">Loading todos...</p>
        <template v-else>
            <TodoItem v-for="todo in todos" :key="todo.id" :todo="todo" @delete="todoStore.deleteTodo" />
            <div v-if="todos.length === 0" class="p-4 text-center text-gray-500 bg-white rounded-lg">Belum ada To-Do.</div>
        </template>
    </div>
</template>