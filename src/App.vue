<template>
  <div id="app">
    <b-navbar type="dark" variant="blue" class="mb-4 custom-navbar">
      <div class="d-flex align-items-center w-100">
        <b-navbar-brand to="/" tag="router-link" class="brand-title">Grandma's Recipes</b-navbar-brand>
        <b-navbar-nav class="nav-left d-flex align-items-center flex-nowrap" style="margin-left: 0;">
          <b-nav-item to="/" tag="router-link">Main</b-nav-item>
          <b-nav-item to="/search" tag="router-link">Search</b-nav-item>
          <b-nav-item to="/about" tag="router-link">About</b-nav-item>
          <b-nav-item-dropdown v-if="store.username" text="Personal" right>
            <b-dropdown-item to="/favorites" tag="router-link">Favorites <span style="color:red">&#9829;</span></b-dropdown-item>
            <b-dropdown-item to="/my-recipes" tag="router-link">Private</b-dropdown-item>
            <b-dropdown-item to="/family-recipes" tag="router-link">La Familia</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item v-if="store.username" @click="showCreateModal = true">Create a recipe</b-nav-item>
        </b-navbar-nav>
        <div class="flex-grow-1"></div>
        <b-navbar-nav class="nav-right d-flex align-items-center">
          <template v-if="!store.username">
            <b-navbar-text class="user-text">Hello Guest</b-navbar-text>
            <b-nav-item to="/login" tag="router-link">Login</b-nav-item>
            <b-nav-item to="/register" tag="router-link">Register</b-nav-item>
          </template>
          <template v-else>
            <b-navbar-text class="user-text">{{ store.username }}</b-navbar-text>
            <b-button variant="outline-light" class="ml-2" @click="logout">Logout</b-button>
          </template>
        </b-navbar-nav>
      </div>
    </b-navbar>
    <router-view />
    <b-modal v-model="showCreateModal" title="New Recipe" hide-footer>
      <b-form @submit.prevent="submitRecipe">
        <b-form-group label="Title">
          <b-form-input v-model="form.title" required />
        </b-form-group>
        <b-form-group label="Image URL">
          <b-form-input v-model="form.image" />
        </b-form-group>
        <b-form-group label="Ready In Minutes">
          <b-form-input type="number" v-model.number="form.readyInMinutes" min="1" required />
        </b-form-group>
        <b-form-group label="Servings">
          <b-form-input type="number" v-model.number="form.servings" min="1" required />
        </b-form-group>
        <b-form-group label="Vegan">
          <b-form-checkbox v-model="form.vegan">Vegan</b-form-checkbox>
        </b-form-group>
        <b-form-group label="Vegetarian">
          <b-form-checkbox v-model="form.vegetarian">Vegetarian</b-form-checkbox>
        </b-form-group>
        <b-form-group label="Gluten Free">
          <b-form-checkbox v-model="form.glutenFree">Gluten Free</b-form-checkbox>
        </b-form-group>
        <b-form-group label="Ingredients (one per line)">
          <b-form-textarea v-model="form.ingredientsText" rows="4" placeholder="e.g. 2 eggs
1 cup flour" />
        </b-form-group>
        <b-form-group label="Instructions (one per line)">
          <b-form-textarea v-model="form.instructionsText" rows="4" placeholder="e.g. Mix ingredients
Bake for 20 minutes" />
        </b-form-group>
        <b-button type="submit" variant="success" class="mt-2">Submit</b-button>
        <b-button variant="secondary" class="mt-2 ml-2" @click="showCreateModal = false">Cancel</b-button>
        <b-alert v-if="submitError" variant="danger" class="mt-3" show>{{ submitError }}</b-alert>
        <b-alert v-if="submitSuccess" variant="success" class="mt-3" show>Recipe created successfully!</b-alert>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { getCurrentInstance, ref, reactive } from 'vue';
import axios from 'axios';

export default {
  name: "App",
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = internalInstance.appContext.config.globalProperties.$router;

    const showCreateModal = ref(false);
    const submitError = ref(null);
    const submitSuccess = ref(false);
    const form = reactive({
      title: '',
      image: '',
      readyInMinutes: 30,
      servings: 1,
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      ingredientsText: '',
      instructionsText: '',
    });

    const submitRecipe = async () => {
      submitError.value = null;
      submitSuccess.value = false;
      try {
        const payload = {
          title: form.title,
          image: form.image,
          readyInMinutes: form.readyInMinutes,
          servings: form.servings,
          vegan: form.vegan,
          vegetarian: form.vegetarian,
          glutenFree: form.glutenFree,
          ingredients: form.ingredientsText.split('\n').map(i => i.trim()).filter(i => i),
          instructions: form.instructionsText.split('\n').map(i => i.trim()).filter(i => i),
        };
        await axios.post('http://localhost:3000/recipes', payload, { withCredentials: true });
        submitSuccess.value = true;
        setTimeout(() => { showCreateModal.value = false; submitSuccess.value = false; }, 1200);
      } catch (e) {
        submitError.value = e.response?.data?.message || 'Failed to create recipe.';
      }
    };

    const logout = () => {
      store.logout();
      if (toast) toast("Logout", "User logged out successfully", "success");
      if (router) router.push("/").catch(() => {});
      else window.location.href = "/";
    };

    return { store, logout, showCreateModal, form, submitRecipe, submitError, submitSuccess };
  }
}
</script>

<style lang="scss">
@use "@/scss/form-style.scss" as *;

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.custom-navbar {
  background-color: #1672fc !important;
  border-radius: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}
.brand-title {
  font-weight: bold;
  font-size: 1.5rem;
  color: #fff !important;
  margin-right: 18px;
}
.nav-left {
  margin-left: 0 !important;
  gap: 8px;
}
.nav-right {
  margin-right: 30px;
}
.user-text {
  color: #e3e3e3 !important;
  margin-right: 10px;
}
.mb-4 {
  margin-bottom: 2rem;
}
</style>
