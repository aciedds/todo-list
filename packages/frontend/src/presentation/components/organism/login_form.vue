<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '@/presentation/components/atoms/AppButton.vue';
import { useAuthStore } from '../../stores/auth_store';
import AppInput from '@/presentation/components/atoms/AppInput.vue';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
</script>
<template>
  <form @submit.prevent="authStore.handleLogin({ email, password })" class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center">Login</h2>
    <div class="space-y-2">
      <label for="email" class="font-medium">Email</label>
      <AppInput id="email" type="email" v-model="email" placeholder="email@example.com" required />
    </div>
    <div class="space-y-2">
      <label for="password" class="font-medium">Password</label>
      <AppInput id="password" type="password" v-model="password" required />
    </div>
    <AppButton type="submit" class="w-full">Login</AppButton>
    <p class="text-sm text-center">Belum punya akun? <RouterLink to="/register" class="text-blue-500 hover:underline">Daftar di sini</RouterLink></p>
  </form>
</template>