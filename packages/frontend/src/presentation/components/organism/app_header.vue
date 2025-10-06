<script setup lang="ts">
import AppButton from '@/presentation/components/atoms/AppButton.vue';
import { useAuthStore } from '../../stores/auth_store';

const authStore = useAuthStore();
</script>
<template>
  <header class="flex items-center justify-between w-full p-4 bg-white shadow-md">
    <h1 class="text-xl font-bold text-blue-600">Todo App</h1>
    <div v-if="authStore.isAuthenticated">
      <AppButton @click="authStore.handleLogout" variant="danger">Logout</AppButton>
    </div>
  </header>
</template>