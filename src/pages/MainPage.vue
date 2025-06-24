<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Left Column: Random Recipes -->
      <div class="col-md-7">
        <h1 class="mb-4 explore-title">Explore Recipes</h1>
        <RecipePreviewList ref="randomList" title="Random Recipes" :limit="3" type="random" />
        <div class="text-center mt-3">
          <button class="btn btn-primary more-btn" @click="refreshRandom">More Recipes</button>
        </div>
      </div>
      <!-- Right Column: Last Viewed or Sign In -->
      <div class="col-md-5 d-flex align-items-center justify-content-center">
        <div v-if="store.username" class="w-100">
          <RecipePreviewList title="Last Viewed Recipes" :recipes="lastViewed" :limit="3" />
        </div>
        <div v-else class="signin-card card p-4 w-100 text-center">
          <h2 class="mb-3">Sign In</h2>
          <p class="mb-4">Log in to see your recently viewed recipes and manage your personal collection.</p>
          <router-link :to="{ name: 'login' }">
            <button class="btn btn-success btn-block wide-btn mb-2">Login</button>
          </router-link>
          <router-link :to="{ name: 'register' }">
            <button class="btn btn-secondary btn-block wide-btn">Register</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, ref, onMounted } from 'vue';
import axios from 'axios';
import RecipePreviewList from "../components/RecipePreviewList.vue";

export default {
  components: {
    RecipePreviewList
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const randomList = ref(null);
    const lastViewed = ref([]);

    const refreshRandom = () => {
      if (randomList.value && randomList.value.updateRecipes) {
        randomList.value.updateRecipes();
      }
    };

    const fetchLastViewed = async () => {
      if (store.username) {
        try {
          const { data } = await axios.get(store.server_domain + '/users/viewed-recipes', { withCredentials: true });
          lastViewed.value = data.recipes || [];
        } catch (e) {
          lastViewed.value = [];
        }
      } else {
        lastViewed.value = [];
      }
    };

    onMounted(() => {
      fetchLastViewed();
    });

    return { store, randomList, refreshRandom, lastViewed, fetchLastViewed };
  }
};
</script>

<style lang="scss" scoped>
.explore-title {
  color: #1672fc;
  font-weight: bold;
}
.more-btn {
  min-width: 120px;
  font-weight: 500;
}
.signin-card {
  max-width: 420px;
  min-width: 320px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  border-radius: 12px;
  background: #fff;
}
.wide-btn {
  width: 100%;
  font-size: 1.15rem;
  padding: 0.7rem 0;
}
.btn-success {
  background-color: #218838 !important;
  border-color: #218838 !important;
}
.btn-secondary {
  background-color: #6c757d !important;
  border-color: #6c757d !important;
}
</style>
