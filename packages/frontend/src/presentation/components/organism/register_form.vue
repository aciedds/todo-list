<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/presentation/stores/auth.store';
import AppButton from '@/presentation/components/atoms/AppButton.vue';
import AppInput from '@/presentation/components/atoms/AppInput.vue';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
</script>
<template>
  <form @submit.prevent="authStore.handleRegister({ email, password })" class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center">Register</h2>
    <div class="space-y-2">
      <label for="email" class="font-medium">Email</label>
      <AppInput id="email" type="email" v-model="email" placeholder="email@example.com" required />
    </div>
    <div class="space-y-2">
      <label for="password" class="font-medium">Password</label>
      <AppInput id="password" type="password" v-model="password" required />
    </div>
    <AppButton type="submit" class="w-full">Register</AppButton>
    <p class="text-sm text-center">Sudah punya akun? <RouterLink to="/login" class="text-blue-500 hover:underline">Login di sini</RouterLink></p>
  </form>
</template>