<template>
  <div class="container mt-4">
    <h2 class="mb-4">My Family Recipes</h2>
    <p class="text-muted mb-4">Treasured recipes passed down through generations</p>
    
    <div v-if="loading" class="text-center">
      <b-spinner label="Loading family recipes..."></b-spinner>
    </div>
    
    <div v-else-if="recipes.length === 0" class="text-center">
      <b-alert variant="info" show>No family recipes found.</b-alert>
    </div>
    
    <div v-else>
      <div class="row">
        <div v-for="recipe in recipes" :key="recipe.id" class="col-12 mb-4">
          <div class="card family-recipe-card">
            <div class="row no-gutters">
              <div class="col-md-4">
                <img 
                  v-if="recipe.image" 
                  :src="recipe.image" 
                  class="card-img family-recipe-image" 
                  :alt="recipe.title"
                />
                <div v-else class="card-img family-recipe-placeholder d-flex align-items-center justify-content-center">
                  <span class="text-muted">No Image</span>
                </div>
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h4 class="card-title">{{ recipe.title }}</h4>
                  
                  <div class="family-info mb-3">
                    <p class="mb-1"><strong>Recipe by:</strong> {{ recipe.owner || recipe.recipeOwner || 'Unknown' }}</p>
                    <p class="mb-1"><strong>Traditional for:</strong> {{ recipe.occasion || recipe.whenToPrepare || 'Special occasions' }}</p>
                  </div>
                  
                  <div class="ingredients mb-3">
                    <h6>Ingredients:</h6>
                    <ul class="ingredient-list">
                      <li v-for="(ingredient, index) in parseIngredients(recipe.ingredients)" :key="index" class="mb-1">
                        {{ ingredient }}
                      </li>
                    </ul>
                  </div>
                  
                  <div class="instructions">
                    <h6>Instructions:</h6>
                    <ol class="preparation-steps">
                      <li v-for="(instruction, index) in parseInstructions(recipe.instructions)" :key="index" class="mb-2">
                        {{ instruction }}
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

export default {
  name: 'FamilyRecipesPage',
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    
    const recipes = ref([]);
    const loading = ref(true);

    const fetchFamilyRecipes = async () => {
      try {
        const { data } = await axios.get(store.server_domain + '/users/family-recipes', { 
          withCredentials: true 
        });
        console.log('Raw family recipes data:', data);
        recipes.value = data.recipes || [];
      } catch (error) {
        console.error('Error fetching family recipes:', error);
        recipes.value = [];
      } finally {
        loading.value = false;
      }
    };

    const parseIngredients = (ingredients) => {
      if (!ingredients) return [];
      
      try {
        // If it's a JSON string, parse it
        if (typeof ingredients === 'string') {
          // Try JSON parsing first
          if (ingredients.startsWith('[') || ingredients.startsWith('{')) {
            const parsed = JSON.parse(ingredients);
            if (Array.isArray(parsed)) {
              return parsed.map(item => 
                typeof item === 'string' ? item : (item.name || item.original || item)
              );
            }
          }
          // Otherwise split by common delimiters
          return ingredients.split(/[,|\n]/).map(item => item.trim()).filter(item => item);
        }
        
        // If it's already an array
        if (Array.isArray(ingredients)) {
          return ingredients.map(item => 
            typeof item === 'string' ? item : (item.name || item.original || item)
          );
        }
        
        return [];
      } catch (e) {
        console.error('Error parsing ingredients:', e, ingredients);
        return [];
      }
    };

    const parseInstructions = (instructions) => {
      if (!instructions) return [];
      
      try {
        let parsedInstructions = [];
        
        // If it's a JSON string, parse it
        if (typeof instructions === 'string') {
          // Try JSON parsing first
          if (instructions.startsWith('[') || instructions.startsWith('{')) {
            const parsed = JSON.parse(instructions);
            if (Array.isArray(parsed)) {
              parsedInstructions = parsed.map(item => 
                typeof item === 'string' ? item : (item.step || item.instruction || item)
              );
            }
          } else {
            // Otherwise split by common delimiters
            parsedInstructions = instructions.split(/[.\n]/).map(item => item.trim()).filter(item => item);
          }
        } else if (Array.isArray(instructions)) {
          // If it's already an array
          parsedInstructions = instructions.map(item => 
            typeof item === 'string' ? item : (item.step || item.instruction || item)
          );
        }
        
        // Filter out standalone numbers and very short non-meaningful content
        return parsedInstructions
          .filter(instruction => {
            const trimmed = instruction.toString().trim();
            // Filter out standalone numbers (like "1", "2", "3", etc.)
            if (/^\d+$/.test(trimmed)) return false;
            // Filter out very short content (less than 3 characters)
            if (trimmed.length < 3) return false;
            // Keep everything else
            return true;
          })
          .map(instruction => instruction.toString().trim());
        
      } catch (e) {
        console.error('Error parsing instructions:', e, instructions);
        return [];
      }
    };

    onMounted(() => {
      fetchFamilyRecipes();
    });

    return {
      recipes,
      loading,
      parseIngredients,
      parseInstructions
    };
  }
};
</script>

<style lang="scss" scoped>
.family-recipe-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }
}

.family-recipe-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.family-recipe-placeholder {
  width: 100%;
  height: 250px;
  background-color: #f8f9fa;
}

.family-info {
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #1672fc;
}

.ingredient-list {
  columns: 2;
  column-gap: 1rem;
  list-style: none;
  padding-left: 0;
  
  li {
    break-inside: avoid;
    padding-left: 1rem;
    position: relative;
    margin-bottom: 0.25rem;
    
    &:before {
      content: "•";
      color: #1672fc;
      font-weight: bold;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}

.preparation-steps {
  li {
    padding-left: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

h6 {
  color: #1672fc;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

@media (max-width: 768px) {
  .ingredients ul {
    columns: 1;
  }
  
  .family-recipe-image,
  .family-recipe-placeholder {
    height: 200px;
  }
}
</style>