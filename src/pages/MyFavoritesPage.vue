<template>
  <div class="container mt-5">
    <h2>My Favorites</h2>
    <div v-if="loading" class="text-center">
      <b-spinner label="Loading favorites..."></b-spinner>
      <p class="mt-2">Loading your favorite recipes...</p>
    </div>
    <div v-else-if="recipes.length === 0 && !error" class="text-center">
      <b-alert variant="info" show>No favorite recipes yet. Start favoriting recipes to see them here!</b-alert>
    </div>
    <RecipePreviewList v-else :recipes="recipes" />
    <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
  </div>
</template>

<script>
import { ref, onMounted, onActivated, getCurrentInstance, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import RecipePreviewList from '../components/RecipePreviewList.vue';

export default {
  name: 'MyFavoritesPage',
  components: { RecipePreviewList },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const route = useRoute();
    const recipes = ref([]);
    const error = ref(null);
    const loading = ref(false);
    
    const fetchFavorites = async () => {
      if (loading.value) return; // Prevent duplicate requests
      loading.value = true;
      error.value = null;
      
      try {
        console.log('Fetching fresh favorites data...');
        const { data } = await axios.get(store.server_domain + '/users/favorites', { withCredentials: true });
        console.log('Favorites data received:', data);
        recipes.value = data.recipes || [];
      } catch (e) {
        console.error('Error fetching favorites:', e);
        error.value = e.response?.data?.message || 'Failed to load favorites.';
        recipes.value = [];
      } finally {
        loading.value = false;
      }
    };
    
    // Fetch on first mount
    onMounted(() => {
      fetchFavorites();
    });
    
    // Fetch every time user navigates back to this page
    onActivated(() => {
      fetchFavorites();
    });
    
    // Watch route changes to refetch when navigating to this page
    watch(() => route.path, (newPath) => {
      if (newPath === '/favorites') {
        fetchFavorites();
      }
    });
    
    return { recipes, error, loading, fetchFavorites };
  },
  
  // Alternative: Navigation guards to ensure fresh data
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // This runs after component is created
      if (vm.fetchFavorites) {
        vm.fetchFavorites();
      }
    });
  },
  
  beforeRouteUpdate(to, from, next) {
    // This runs when route changes but component stays the same
    this.fetchFavorites();
    next();
  },
};
</script> 