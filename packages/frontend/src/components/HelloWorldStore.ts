import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useHealthStore = defineStore("health", () => {
  //States
  const data = ref(null);
  const error = ref("");
  const isLoading = ref(false);

  const fetchHealth = async () => {
    isLoading.value = true;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/health`
      );
      console.log(response.data);
      data.value = response.data;
    } catch (err: any) {
      error.value = "Failed to fetch data: " + (err?.message || err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    error,
    isLoading,
    fetchHealth,
  };
});
