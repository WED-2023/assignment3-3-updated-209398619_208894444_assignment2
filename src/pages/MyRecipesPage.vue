<template>
  <div class="container mt-5">
    <h2>My Recipes</h2>
    <RecipePreviewList :recipes="recipes" />
    <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import RecipePreviewList from '../components/RecipePreviewList.vue';

export default {
  name: 'MyRecipesPage',
  components: { RecipePreviewList },
  setup() {
    const recipes = ref([]);
    const error = ref(null);
    onMounted(async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/users/recipes', { withCredentials: true });
        recipes.value = data;
      } catch (e) {
        error.value = e.response?.data?.message || 'Failed to load your recipes.';
      }
    });
    return { recipes, error };
  },
};
</script> 