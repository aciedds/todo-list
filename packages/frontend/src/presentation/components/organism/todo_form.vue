<script setup lang="ts">
import { ref } from 'vue';
import { useTodoStore } from '@/presentation/stores/todo.store';
import AppButton from '@/presentation/components/atoms/AppButton.vue';
import AppInput from '@/presentation/components/atoms/AppInput.vue';

const todoStore = useTodoStore();
const newTodoTitle = ref('');
</script>
<template>
  <form @submit.prevent="todoStore.addTodo({ title: newTodoTitle }); newTodoTitle = ''" class="flex gap-2 p-4 mt-4 bg-white rounded-lg shadow-md">
    <AppInput v-model="newTodoTitle" placeholder="Apa rencanamu hari ini?" class="flex-grow" />
    <AppButton type="submit">Tambah</AppButton>
  </form>
</template>