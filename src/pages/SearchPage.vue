<template>
  <div class="container mt-4">
    <h2 class="mb-4">Recipe Search</h2>
    <b-form @submit.prevent="onSearch">
      <b-row class="align-items-end">
        <b-col cols="12" md="3" class="mb-2">
          <b-form-group label="Recipe Name">
            <b-form-input v-model="form.query" placeholder="Enter recipe or dish name" required />
          </b-form-group>
        </b-col>
        <b-col cols="6" md="2" class="mb-2">
          <b-form-group label="Results">
            <b-form-select v-model="form.number" :options="numberOptions" />
          </b-form-group>
        </b-col>
        <b-col cols="6" md="2" class="mb-2">
          <b-form-group label="Cuisine">
            <b-form-select v-model="form.cuisine" :options="cuisineOptions" class="custom-select" />
          </b-form-group>
        </b-col>
        <b-col cols="6" md="2" class="mb-2">
          <b-form-group label="Diet">
            <b-form-select v-model="form.diet" :options="dietOptions" class="custom-select" />
          </b-form-group>
        </b-col>
        <b-col cols="6" md="3" class="mb-2">
          <b-form-group label="Intolerance">
            <b-form-select v-model="form.intolerance" :options="intoleranceOptions" class="custom-select" />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="align-items-end">
        <b-col cols="12" md="3" class="mb-2">
          <b-form-group label="Sort By">
            <b-form-select v-model="form.sort" :options="sortOptions" />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="9" class="mb-2 d-flex align-items-end justify-content-end">
          <b-button type="submit" variant="primary" :disabled="loading">
            <span v-if="loading">Searching...</span>
            <span v-else>Search</span>
          </b-button>
        </b-col>
      </b-row>
    </b-form>

    <div v-if="lastSearch && !results.length && !loading" class="mt-3">
      <b-alert variant="info" show>
        Last search: <strong>{{ lastSearch.query }}</strong>
        <span v-if="lastSearch.cuisine"> | Cuisine: {{ lastSearch.cuisine }}</span>
        <span v-if="lastSearch.diet"> | Diet: {{ lastSearch.diet }}</span>
        <span v-if="lastSearch.intolerance"> | Intolerance: {{ lastSearch.intolerance }}</span>
      </b-alert>
    </div>

    <div v-if="results.length" class="mt-4">
      <h4>Results</h4>
      <div class="container-fluid">
        <div v-for="row in chunkedResults" :key="row[0]?.id" class="row mb-4">
          <div v-for="recipe in row" :key="recipe.id" class="col-md-2 col-12 d-flex">
            <RecipePreview :recipe="recipe" class="flex-fill" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!loading && searched" class="mt-4">
      <b-alert variant="warning" show>No recipes found for your search.</b-alert>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue';
import axios from 'axios';
import RecipePreview from '../components/RecipePreview.vue';

const cuisineOptions = [
  { value: '', text: 'Any Cuisine' },
  { value: 'African', text: 'African' },
  { value: 'American', text: 'American' },
  { value: 'British', text: 'British' },
  { value: 'Cajun', text: 'Cajun' },
  { value: 'Caribbean', text: 'Caribbean' },
  { value: 'Chinese', text: 'Chinese' },
  { value: 'Eastern European', text: 'Eastern European' },
  { value: 'European', text: 'European' },
  { value: 'French', text: 'French' },
  { value: 'German', text: 'German' },
  { value: 'Greek', text: 'Greek' },
  { value: 'Indian', text: 'Indian' },
  { value: 'Irish', text: 'Irish' },
  { value: 'Italian', text: 'Italian' },
  { value: 'Japanese', text: 'Japanese' },
  { value: 'Jewish', text: 'Jewish' },
  { value: 'Korean', text: 'Korean' },
  { value: 'Latin American', text: 'Latin American' },
  { value: 'Mediterranean', text: 'Mediterranean' },
  { value: 'Mexican', text: 'Mexican' },
  { value: 'Middle Eastern', text: 'Middle Eastern' },
  { value: 'Nordic', text: 'Nordic' },
  { value: 'Southern', text: 'Southern' },
  { value: 'Spanish', text: 'Spanish' },
  { value: 'Thai', text: 'Thai' },
  { value: 'Vietnamese', text: 'Vietnamese' },
];
const dietOptions = [
  { value: '', text: 'Any Diet' },
  { value: 'Gluten Free', text: 'Gluten Free' },
  { value: 'Ketogenic', text: 'Ketogenic' },
  { value: 'Vegetarian', text: 'Vegetarian' },
  { value: 'Lacto-Vegetarian', text: 'Lacto-Vegetarian' },
  { value: 'Ovo-Vegetarian', text: 'Ovo-Vegetarian' },
  { value: 'Vegan', text: 'Vegan' },
  { value: 'Pescetarian', text: 'Pescetarian' },
  { value: 'Paleo', text: 'Paleo' },
  { value: 'Primal', text: 'Primal' },
  { value: 'Low FODMAP', text: 'Low FODMAP' },
  { value: 'Whole30', text: 'Whole30' },
];
const intoleranceOptions = [
  { value: 'Dairy', text: 'Dairy' },
  { value: 'Egg', text: 'Egg' },
  { value: 'Gluten', text: 'Gluten' },
  { value: 'Grain', text: 'Grain' },
  { value: 'Peanut', text: 'Peanut' },
  { value: 'Seafood', text: 'Seafood' },
  { value: 'Sesame', text: 'Sesame' },
  { value: 'Shellfish', text: 'Shellfish' },
  { value: 'Soy', text: 'Soy' },
  { value: 'Sulfite', text: 'Sulfite' },
  { value: 'Tree Nut', text: 'Tree Nut' },
  { value: 'Wheat', text: 'Wheat' },
];
const numberOptions = [
  { value: 5, text: '5' },
  { value: 10, text: '10' },
  { value: 15, text: '15' },
];
const sortOptions = [
  { value: '', text: 'None' },
  { value: 'popularity', text: 'Popularity' },
  { value: 'readyInMinutes', text: 'Preparation Time' },
];

export default {
  name: 'SearchPage',
  components: { RecipePreview: RecipePreview },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    
    const form = reactive({
      query: '',
      number: 5,
      cuisine: '',
      diet: '',
      intolerance: '',
      sort: '',
    });
    const results = ref([]);
    const loading = ref(false);
    const lastSearch = ref(null);
    const searched = ref(false);

    const chunkedResults = computed(() => {
      const chunkSize = 5;
      const arr = [];
      for (let i = 0; i < results.value.length; i += chunkSize) {
        arr.push(results.value.slice(i, i + chunkSize));
      }
      return arr;
    });

    onMounted(async () => {
      // Fetch last search if logged in
      try {
        const { data } = await axios.get(store.server_domain + '/users/last-search', { withCredentials: true });
        if (data.lastSearch && data.lastSearch.query) {
          lastSearch.value = data.lastSearch;
          form.query = data.lastSearch.query;
          form.number = data.lastSearch.number || 5;
          form.cuisine = data.lastSearch.cuisine || '';
          form.diet = data.lastSearch.diet || '';
          form.intolerance = data.lastSearch.intolerance || '';
          // Auto-search on mount if last search exists
          await onSearch();
        }
      } catch (e) {
        // Not logged in or no last search
      }
    });

    const onSearch = async () => {
      loading.value = true;
      searched.value = true;
      results.value = [];
      try {
        const params = {
          query: form.query,
          number: form.number,
          cuisine: form.cuisine,
          diet: form.diet,
          intolerances: form.intolerance,
        };
        const { data } = await axios.get(store.server_domain + '/recipes/search', { params, withCredentials: true });
        let fetched = data.recipes || [];
        // Client-side sort
        if (form.sort === 'popularity') {
          fetched = [...fetched].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        } else if (form.sort === 'readyInMinutes') {
          fetched = [...fetched].sort((a, b) => (a.readyInMinutes || 0) - (b.readyInMinutes || 0));
        }
        results.value = fetched;
      } catch (e) {
        results.value = [];
      } finally {
        loading.value = false;
      }
    };

    return {
      store,
      form,
      results,
      loading,
      lastSearch,
      searched,
      cuisineOptions,
      dietOptions,
      intoleranceOptions,
      numberOptions,
      sortOptions,
      onSearch,
      chunkedResults,
    };
  },
};
</script>

<style scoped>
.title {
  font-weight: bold;
  margin-bottom: 1rem;
}
.custom-select {
  min-height: 38px;
  height: 38px;
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}
</style>
  