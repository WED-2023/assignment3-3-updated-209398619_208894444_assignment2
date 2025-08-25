import { createApp } from 'vue';
import App from './App.vue';
import routes from './router/index';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { createRouter, createWebHistory } from 'vue-router';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';

// BootstrapVue 3
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import Vuelidate from '@vuelidate/core';
import { BNavbarText } from 'bootstrap-vue-3';

// Router setup
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Import consolidated store
import store from './store.js';

// Axios interceptors
axios.interceptors.request.use((config) => config, (error) => Promise.reject(error));
axios.interceptors.response.use((response) => response, (error) => Promise.reject(error));

// Create app
const app = createApp(App);

// Plugins
app.use(router);
app.use(VueAxios, axios);
app.use(BootstrapVue3);
app.use(Vuelidate);
app.component('b-navbar-text', BNavbarText);

// Global store
app.config.globalProperties.store = store;

// Mount app
app.mount('#app');
