<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;
const data  = ref(null);
const error = ref('');

onMounted(async () => {
  try {
    const response = await axios.get(`${baseUrl}/health`);
    console.log(response.data);
    data.value = response.data;
  } catch(err: any) {
    error.value = "Failed to fetch data: " + (err?.message || err);
  }
});
</script>

<template>
  <div class="w-full h-screen grid place-content-center">
    <h1>HelloWorld</h1>
    <p>Base URL: {{ baseUrl }}</p>
    <div>
      <div v-if="data">
        <pre>Data: {{ JSON.stringify(data, null, 2) }}</pre>
      </div>
      <div v-else-if="error" class="error">Error Message: {{ error }}</div>
      <div v-else>Loading...</div>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
