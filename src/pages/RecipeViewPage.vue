<template>
    <div class="container">
      <div v-if="recipe">
        <div class="recipe-header mt-3 mb-4 text-center">
          <h1>{{ recipe.title }}</h1>
          <img :src="recipe.image" class="recipe-image mb-3" />
          <div class="preview-details mb-2">
            <span class="clock-icon" aria-label="minutes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            {{ recipe.readyInMinutes }}
            <span v-if="recipe.isVegan" class="icon vegan ml-2" title="Vegan">🍃🍃</span>
            <span v-else-if="recipe.isVegetarian" class="icon vegetarian ml-2" title="Vegetarian">🍃</span>
            <span v-if="recipe.glutenFree" class="icon gluten-free ml-2" title="Gluten Free"><span class="gluten-free-text">Gluten Free</span></span>
            <span v-if="recipe.isViewed" class="viewed-indicator ml-2" title="Viewed">👁️</span>
            <span class="favorite-indicator ml-2" :class="{ favorited: recipe.isFavorite }" title="Favorite">
              <svg v-if="recipe.isFavorite" width="20" height="20" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
          </div>
          <div class="servings mb-2" v-if="recipe.servings">
            <strong>Servings:</strong> {{ recipe.servings }}
          </div>
        </div>
        <div class="recipe-body row">
          <div class="col-md-6 mb-4">
            <h4>Ingredients</h4>
            <ul>
              <li v-for="(r, index) in recipe.extendedIngredients" :key="index + '_' + r.id">
                {{ r.original }}
              </li>
            </ul>
          </div>
          <div class="col-md-6 mb-4">
            <h4>Instructions</h4>
            <ol>
              <li v-for="s in recipe._instructions" :key="s.number">
                {{ s.step }}
              </li>
            </ol>
          </div>
        </div>
        <!-- <pre>
        {{ $route.params }}
        {{ recipe }}
      </pre
        > -->
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        recipe: null
      };
    },
    async created() {
      try {
        let response;
        // response = this.$route.params.response;
  
        try {
          response = await this.axios.get(
            // "https://test-for-3-2.herokuapp.com/recipes/info",
            this.$root.store.server_domain + "/recipes/info",
            {
              params: { id: this.$route.params.recipeId }
            }
          );
  
          // console.log("response.status", response.status);
          if (response.status !== 200) this.$router.replace("/NotFound");
        } catch (error) {
          console.log("error.response.status", error.response.status);
          this.$router.replace("/NotFound");
          return;
        }
  
        let {
          analyzedInstructions,
          instructions,
          extendedIngredients,
          readyInMinutes,
          image,
          title,
          servings,
          isVegan,
          isVegetarian,
          glutenFree,
          isFavorite,
          isViewed
        } = response.data.recipe;
  
        let _instructions = analyzedInstructions
          .map((fstep) => {
            fstep.steps[0].step = fstep.name + fstep.steps[0].step;
            return fstep.steps;
          })
          .reduce((a, b) => [...a, ...b], []);
  
        let _recipe = {
          instructions,
          _instructions,
          analyzedInstructions,
          extendedIngredients,
          readyInMinutes,
          image,
          title,
          servings,
          isVegan,
          isVegetarian,
          glutenFree,
          isFavorite,
          isViewed
        };
  
        this.recipe = _recipe;
      } catch (error) {
        console.log(error);
      }
    }
  };
  </script>
  
  <style scoped>
  .recipe-header {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    padding: 2rem 2.5rem 1rem 2.5rem;
  }
  .recipe-image {
    max-width: 350px;
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .preview-details {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .icon {
    font-size: 1.2em;
  }
  .gluten-free-text {
    color: orange;
    font-weight: bold;
    font-size: 1em;
  }
  .favorite-indicator {
    margin-left: 8px;
    cursor: pointer;
    transition: transform 0.1s;
  }
  .favorite-indicator.favorited svg {
    filter: drop-shadow(0 0 2px red);
  }
  .viewed-indicator {
    margin-left: 8px;
    color: #888;
    font-size: 1.2em;
  }
  .clock-icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: 4px;
    margin-bottom: 2px;
  }
  .servings {
    font-size: 1.1rem;
  }
  .recipe-body {
    margin-top: 2rem;
  }
  </style>
  