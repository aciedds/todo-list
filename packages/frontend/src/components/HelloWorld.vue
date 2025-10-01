<script setup lang="ts">
import { onMounted } from 'vue';
import { useHealthStore } from './HelloWorldStore';
import { storeToRefs } from 'pinia';

// Setup Stores
const healthStore = useHealthStore();
const { data, error, isLoading } = storeToRefs(healthStore);

onMounted(() => {
  healthStore.fetchHealth();
});

</script>

<template>
  <div class="w-full h-screen grid place-content-center">
    <h1>HelloWorld</h1>
    <div>
      <div v-if="isLoading">
        <p>Loading...</p>
      </div>
      <div v-else>
        <div v-if="data">
        <pre>Data: {{ JSON.stringify(data, null, 2) }}</pre>
        </div>
        <div v-if="error">
          <p class="error">Error: {{ error.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
