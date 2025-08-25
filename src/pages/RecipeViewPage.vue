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
            <span v-if="recipe.vegan || recipe.isVegan" class="icon vegan ml-2" title="Vegan">🍃🍃</span>
            <span v-else-if="recipe.vegetarian || recipe.isVegetarian" class="icon vegetarian ml-2" title="Vegetarian">🍃</span>
            <span v-if="recipe.glutenFree" class="icon gluten-free ml-2" title="Gluten Free"><span class="gluten-free-text">GF</span></span>
            <span v-if="recipe.isViewed || recipe.viewed" class="viewed-indicator ml-2" title="Viewed">👁️</span>
            <span class="favorite-indicator ml-2" :class="{ favorited: recipe.isFavorite }" title="Favorite">
              <svg v-if="recipe.isFavorite" width="20" height="20" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
          </div>
          <div class="servings mb-3" v-if="recipe.servings">
            <h5><strong>Servings: {{ recipe.servings }}</strong></h5>
          </div>
        </div>
        <div class="recipe-body row">
          <div class="col-md-6 mb-4">
            <h4>Ingredients</h4>
            <ul class="ingredients-list">
              <li v-for="(ingredient, index) in recipe.extendedIngredients || recipe.ingredients" :key="index">
                {{ formatIngredient(ingredient) }}
              </li>
            </ul>
          </div>
          <div class="col-md-6 mb-4">
            <h4>Instructions</h4>
            <ol class="instructions-list" v-if="recipe._instructions && recipe._instructions.length > 0">
              <li v-for="(instruction, index) in recipe._instructions" :key="index" class="mb-2">
                {{ formatInstruction(instruction.step || instruction) }}
              </li>
            </ol>
            <ol class="instructions-list" v-else-if="recipe.instructions && recipe.instructions.length > 0">
              <li v-for="(instruction, index) in recipe.instructions" :key="index" class="mb-2">
                {{ formatInstruction(instruction.step || instruction) }}
              </li>
            </ol>
            <p v-else class="text-muted">No instructions available for this recipe.</p>
          </div>
        </div>
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
    methods: {
      formatIngredient(ingredient) {
        if (typeof ingredient === 'string') {
          // If it's just a string, capitalize it
          return this.capitalizeFirst(ingredient);
        }
        
        // If it's an object with detailed info
        if (ingredient.original) {
          return this.capitalizeFirst(ingredient.original);
        }
        
        // Build from components if available
        let formatted = '';
        if (ingredient.amount) {
          formatted += ingredient.amount;
          if (ingredient.unit) {
            formatted += ' ' + ingredient.unit;
          }
          formatted += ' ';
        }
        formatted += ingredient.name || ingredient;
        
        return this.capitalizeFirst(formatted);
      },
      
      formatInstruction(instruction) {
        if (!instruction) return '';
        return this.capitalizeFirst(instruction.toString().trim());
      },
      
      capitalizeFirst(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
      }
    },
    async created() {
      try {
        let response;
  
        try {
          response = await this.axios.get(
            this.$root.store.server_domain + "/recipes/" + this.$route.params.recipeId,
            { withCredentials: true }
          );
  
          if (response.status !== 200) this.$router.replace("/NotFound");
        } catch (error) {
          console.log("error.response.status", error.response.status);
          this.$router.replace("/NotFound");
          return;
        }
  
        let recipeData = response.data;
        console.log('Recipe data received:', recipeData);
        
        // Handle different data structures from Spoonacular vs custom recipes
        let recipe = {
          analyzedInstructions: recipeData.analyzedInstructions,
          instructions: recipeData.instructions,
          extendedIngredients: recipeData.extendedIngredients || recipeData.ingredients,
          ingredients: recipeData.ingredients,
          readyInMinutes: recipeData.readyInMinutes,
          image: recipeData.image,
          title: recipeData.title,
          servings: recipeData.servings,
          vegan: recipeData.vegan,
          vegetarian: recipeData.vegetarian,
          isVegan: recipeData.isVegan || recipeData.vegan,
          isVegetarian: recipeData.isVegetarian || recipeData.vegetarian,
          glutenFree: recipeData.glutenFree,
          isFavorite: recipeData.isFavorite,
          isViewed: recipeData.isViewed || recipeData.viewed,
          viewed: recipeData.viewed
        };

        let _instructions = [];
        
        // Handle analyzedInstructions (Spoonacular format)
        if (recipe.analyzedInstructions && Array.isArray(recipe.analyzedInstructions) && recipe.analyzedInstructions.length > 0) {
          try {
            _instructions = recipe.analyzedInstructions
              .map((fstep) => {
                if (fstep.steps && Array.isArray(fstep.steps) && fstep.steps.length > 0) {
                  return fstep.steps.map(step => ({
                    number: step.number,
                    step: step.step
                  }));
                }
                return [];
              })
              .reduce((a, b) => [...a, ...b], [])
              .sort((a, b) => a.number - b.number); // Sort by step number
          } catch (e) {
            console.log('Error processing analyzedInstructions:', e);
          }
        }
        
        // Fallback to instructions field
        if (_instructions.length === 0 && recipe.instructions) {
          if (typeof recipe.instructions === 'string') {
            // If it's a string, split by sentences or line breaks
            _instructions = recipe.instructions
              .split(/[.\n]/)
              .map(inst => inst.trim())
              .filter(inst => inst.length > 0)
              .map((inst, index) => ({ 
                number: index + 1, 
                step: inst 
              }));
          } else if (Array.isArray(recipe.instructions)) {
            _instructions = recipe.instructions.map((inst, index) => ({ 
              number: index + 1, 
              step: typeof inst === 'string' ? inst : inst.step || inst.toString()
            }));
          }
        }
        
        console.log('Processed instructions:', _instructions);

        recipe._instructions = _instructions;
        this.recipe = recipe;
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
  
  .ingredients-list li {
    margin-bottom: 0.5rem;
    font-size: 1.05rem;
    line-height: 1.4;
  }
  
  .instructions-list li {
    margin-bottom: 1rem;
    font-size: 1.05rem;
    line-height: 1.5;
    padding-left: 0.5rem;
  }
  
  .servings h5 {
    color: #1672fc;
    font-weight: 600;
  }
  </style>