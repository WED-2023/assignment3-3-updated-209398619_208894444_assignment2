<template>
  <div class="container">
    <h3>{{ title }}</h3>
    
    <div class="row">
      <div class="col" v-for="r in recipesToShow" :key="r.id">
        <RecipePreview class="recipePreview" :recipe="r" />
      </div>
    </div>
  </div>
</template>

<script>
import RecipePreview from "./RecipePreview.vue";

export default {
  name: "RecipePreviewList",
  components: {
    RecipePreview,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    recipes: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
    },
    limit: {
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      internalRecipes: [],
    };
  },
  mounted() {
    if (this.type === 'random') {
      this.updateRecipes();
    } else {
      this.internalRecipes = this.recipes;
    }
  },
  watch: {
    recipes(newVal) {
      if (this.type !== 'random') {
        this.internalRecipes = newVal;
      }
    }
  },
  methods: {
    async updateRecipes() {
      try {
        const response = await this.axios.get(
          this.$root.store.server_domain + "/recipes/random"
        );
        const recipes = response.data.recipes;
        this.internalRecipes = [];
        this.internalRecipes.push(...recipes);
      } catch (error) {
        console.log(error);
      }
    },
  },
  computed: {
    recipesToShow() {
      return this.internalRecipes.slice(0, this.limit);
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 400px;
}
</style>
