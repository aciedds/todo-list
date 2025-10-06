<script setup lang="ts">
const model = defineModel<string>();
</script>
<template>
  <input v-model="model" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
</template>