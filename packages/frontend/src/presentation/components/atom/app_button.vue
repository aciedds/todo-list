<script setup lang="ts">
defineProps<{ variant?: 'primary' | 'danger' }>();
</script>
<template>
  <button :class="['px-4 py-2 rounded font-semibold text-white transition-colors', variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600']">
    <slot />
  </button>
</template>