import Main from "../pages/MainPage.vue";
import NotFound from "../pages/NotFoundPage.vue";
import MyFavoritesPage from '../pages/MyFavoritesPage.vue';
import MyRecipesPage from '../pages/MyRecipesPage.vue';

const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../pages/RegisterPage.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/LoginPage.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../pages/SearchPage.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../pages/AboutPage.vue"),
  },
  {
    path: "/recipe/:recipeId",
    name: "recipe",
    component: () => import("../pages/RecipeViewPage.vue"),
  },
  {
    path: "/favorites",
    name: "MyFavorites",
    component: MyFavoritesPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/my-recipes",
    name: "MyRecipes",
    component: MyRecipesPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/:catchAll(.*)",
    name: "notFound",
    component: NotFound,
  }
];

export default routes;
