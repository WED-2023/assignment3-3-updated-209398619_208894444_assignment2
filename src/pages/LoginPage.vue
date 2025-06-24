<template>
  <div class="container mt-4" style="max-width: 400px;">
    <h2 class="mb-4">Login</h2>
    <b-form @submit.prevent="login">
      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="state.username"
          :state="getValidationState(v$.username)"
        />
        <b-form-invalid-feedback v-if="v$.username.$error">
          Username is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Password" label-for="password">
        <b-form-input
          id="password"
          type="password"
          v-model="state.password"
          :state="getValidationState(v$.password)"
        />
        <b-form-invalid-feedback v-if="v$.password.$error">
          Password is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <b-button type="submit" variant="primary" class="w-100" :disabled="state.loading">
        <span v-if="state.loading">Logging in...</span>
        <span v-else>Login</span>
      </b-button>

      <b-alert
        variant="danger"
        class="mt-3"
        dismissible
        v-if="state.submitError"
        show
      >
        Login failed: {{ state.submitError }}
      </b-alert>

      <div class="mt-2">
        Don't have an account?
        <router-link to="/register">Register here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import axios from 'axios';
import { useRouter } from 'vue-router';
import store from '../store';

export default {
  name: 'LoginPage',
  setup() {
    const state = reactive({
      username: '',
      password: '',
      submitError: null,
      loading: false,
    });

    const rules = {
      username: { required },
      password: { required },
    };

    const v$ = useVuelidate(rules, state);
    const router = useRouter();

    const getValidationState = (field) => {
      return field.$dirty ? !field.$invalid : null;
    };

    const login = async () => {
      const valid = await v$.value.$validate();
      if (!valid) return;
      state.submitError = null;
      state.loading = true;
      try {
        await axios.post('http://localhost:3000/auth/login', {
          username: state.username,
          password: state.password,
        }, { withCredentials: true });
        store.login(state.username);
        router.push('/');
        setTimeout(() => { window.location.reload(); }, 100);
      } catch (err) {
        const msg = err.response?.data?.message?.toLowerCase() || '';
        if (msg.includes('no such user')) {
          state.submitError = 'No such user found.';
        } else if (msg.includes('wrong credentials') || msg.includes('incorrect') || msg.includes('invalid')) {
          state.submitError = 'Wrong credentials (username/password).';
        } else {
          state.submitError = err.response?.data?.message || 'Unexpected error.';
        }
      } finally {
        state.loading = false;
      }
    };

    return { state, v$, login, getValidationState };
  },
};
</script>
