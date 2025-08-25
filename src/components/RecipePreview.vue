<template>
  <div class="card h-100 recipe-preview">
    <div class="image-container" @click="goToRecipe" v-b-tooltip.hover title="Click to view recipe!">
      <img
        v-if="recipe.image"
        :src="recipe.image"
        class="card-img-top recipe-image"
        alt="Recipe image"
      />
      <div class="image-overlay">
        <span>View Recipe</span>
      </div>
    </div>
    <div class="card-body text-center">
      <h5 class="card-title">{{ recipe.title }}</h5>
      <p class="card-text">
        <span class="clock-icon" aria-label="minutes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </span>
        {{ recipe.readyInMinutes }}
      </p>
      <div class="icons mb-2">
        <span v-if="recipe.vegan || recipe.isVegan" class="icon vegan" title="Vegan">🍃🍃</span>
        <span v-else-if="recipe.vegetarian || recipe.isVegetarian" class="icon vegetarian" title="Vegetarian">🍃</span>
        <span v-if="recipe.glutenFree" class="icon gluten-free" title="Gluten Free"> <span class="gluten-free-text">GF</span> </span>
      </div>
      <div class="indicators mb-2">
        <span v-if="recipe.isViewed" class="viewed-indicator" title="Viewed">👁️</span>
        <span class="favorite-indicator" @click.stop="addToFavorites" :class="{ favorited: recipe.isFavorite }" title="Add to Favorites">
          <svg v-if="recipe.isFavorite" width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true
    }
  },
  methods: {
    goToRecipe() {
      // Just navigate to recipe page - let the recipe page handle view recording
      this.$router.push({ name: 'recipe', params: { recipeId: this.recipe.id } });
    },
    async addToFavorites() {
      const store = this.$root.store;
      if (!store || !store.username) {
        // User not logged in - redirect to login
        this.$router.push({ name: 'login' });
        return;
      }

      try {
        await this.axios.post(`${store.server_domain}/users/favorites`, 
          { recipeId: this.recipe.id }, 
          { withCredentials: true }
        );
        
        // Emit success event for parent components to update the recipe
        this.$emit('added-to-favorites', this.recipe.id);
      } catch (error) {
        console.error('Failed to add to favorites:', error);
        // Handle specific error cases
        if (error.response?.status === 409) {
          // Already in favorites - emit event for parent to handle
          this.$emit('added-to-favorites', this.recipe.id);
        } else if (error.response?.status === 401) {
          // Session expired
          store.logout();
          this.$router.push({ name: 'login' });
        }
      }
    }
  }
}
</script>

<style scoped>
.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: 0.3s;
  cursor: pointer;
}
.image-container {
  position: relative;
  cursor: pointer;
}
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 1.5em;
  pointer-events: none;
}
.image-container:hover .image-overlay {
  opacity: 1;
}
.icons .icon {
  margin: 0 4px;
  font-size: 1.2em;
}
.gluten-free-text {
  color: orange;
  font-weight: bold;
  font-size: 1em;
}
.indicators {
  display: flex;
  justify-content: center;
  align-items: center;
}
.favorite-indicator {
  margin-left: 8px;
  cursor: pointer;
  transition: transform 0.1s;
}
.favorite-indicator:active {
  transform: scale(1.2);
}
.favorite-indicator svg {
  vertical-align: middle;
}
.favorite-indicator.favorited svg {
  filter: drop-shadow(0 0 2px red);
}
.viewed-indicator {
  margin-right: 8px;
  color: #888;
  font-size: 1.2em;
}
.clock-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 4px;
  margin-bottom: 2px;
}
</style>
