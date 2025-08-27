<template>
  <div class="container mt-4" style="max-width: 500px;">
    <h2 class="mb-4">Register</h2>
    <b-form @submit.prevent="register">
      <!-- Username -->
      <b-form-group label="Username" label-for="username">
        <b-form-input
          id="username"
          v-model="state.username"
          :state="v$.username.$dirty ? !v$.username.$error : null"
          @blur="v$.username.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.username.$error">
          <div v-if="!v$.username.required">Username is required.</div>
          <div v-else-if="!v$.username.minLength || !v$.username.maxLength">
            Username must be 3–8 characters.
          </div>
          <div v-else-if="!v$.username.alpha">Username must contain only letters.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- First Name -->
      <b-form-group label="First Name" label-for="firstName">
        <b-form-input
          id="firstName"
          v-model="state.firstName"
          :state="v$.firstName.$dirty ? !v$.firstName.$error : null"
          @blur="v$.firstName.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.firstName.$error">
          First name is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Last Name -->
      <b-form-group label="Last Name" label-for="lastName">
        <b-form-input
          id="lastName"
          v-model="state.lastName"
          :state="v$.lastName.$dirty ? !v$.lastName.$error : null"
          @blur="v$.lastName.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.lastName.$error">
          Last name is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Email -->
      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          type="email"
          v-model="state.email"
          :state="v$.email.$dirty ? !v$.email.$error : null"
          @blur="v$.email.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.email.$error">
          <div v-if="!v$.email.required">Email is required.</div>
          <div v-else>Email must be valid.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Country -->
      <b-form-group label="Country" label-for="country">
        <b-form-select
          id="country"
          v-model="state.country"
          :options="countries"
          :state="v$.country.$dirty ? !v$.country.$error : null"
          @change="v$.country.$touch()"
        />
        <b-form-invalid-feedback v-if="v$.country.$error">
          Country is required.
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Password -->
      <b-form-group label="Password" label-for="password">
        <b-input-group>
          <b-form-input
            id="password"
            :type="state.showPassword ? 'text' : 'password'"
            v-model="state.password"
            :state="v$.password.$dirty ? !v$.password.$error : null"
            @blur="v$.password.$touch()"
            @input="() => v$.confirmedPassword.$touch()"
          />
          <b-input-group-append>
            <b-button 
              variant="outline-secondary" 
              @click="state.showPassword = !state.showPassword"
              type="button"
            >
              <i :class="state.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <b-form-invalid-feedback v-if="v$.password.$error">
          <div v-if="!v$.password.required">Password is required.</div>
          <div v-else-if="!v$.password.minLength || !v$.password.maxLength">
            Password must be 5–10 characters.
          </div>
          <div v-else-if="!v$.password.hasNumber">Password must contain at least one number.</div>
          <div v-else-if="!v$.password.hasSpecial">Password must contain at least one special character.</div>
        </b-form-invalid-feedback>
      </b-form-group>

      <!-- Confirm Password -->
      <b-form-group label="Confirm Password" label-for="confirmedPassword">
        <b-input-group>
          <b-form-input
            id="confirmedPassword"
            :type="state.showConfirmPassword ? 'text' : 'password'"
            v-model="state.confirmedPassword"
            :state="!v$.confirmedPassword.$dirty ? null : (state.password === state.confirmedPassword ? true : false)"
            @blur="v$.confirmedPassword.$touch()"
            @input="() => v$.confirmedPassword.$touch()"
          />
          <b-input-group-append>
            <b-button 
              variant="outline-secondary" 
              @click="state.showConfirmPassword = !state.showConfirmPassword"
              type="button"
            >
              <i :class="state.showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </b-button>
          </b-input-group-append>
        </b-input-group>
        <b-form-invalid-feedback v-if="v$.confirmedPassword.$error">
          <div v-if="!v$.confirmedPassword.required">Confirmation is required.</div>
          <div v-else-if="!v$.confirmedPassword.sameAsPassword">
            Passwords do not match.
          </div>
        </b-form-invalid-feedback>
      </b-form-group>

      <b-button type="submit" variant="success" class="w-100">Register</b-button>

      <b-alert
        variant="danger"
        class="mt-3"
        dismissible
        v-if="state.submitError"
        show
      >
        Registration failed: {{ state.submitError }}
      </b-alert>

      <div class="mt-2">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </div>
    </b-form>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength, alpha, email as emailValidator } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import axios from 'axios';
import store from '../store';

function hasNumber(value) {
  return /[0-9]/.test(value);
}
function hasSpecial(value) {
  return /[^A-Za-z0-9]/.test(value);
}

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter();
    const state = reactive({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmedPassword: '',
      country: '',
      submitError: null,
      showPassword: false,
      showConfirmPassword: false,
    });

    const rules = {
      username: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(8),
        alpha,
      },
      firstName: { required },
      lastName: { required },
      email: { required, email: emailValidator },
      country: { required },
      password: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(10),
        hasNumber,
        hasSpecial,
      },
      confirmedPassword: {
        required,
        sameAsPassword: (value) => value === state.password,
      },
    };

    const v$ = useVuelidate(rules, state);

    const countries = reactive([{ value: '', text: 'Loading countries...' }]);
    onMounted(async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name');
        const data = await res.json();
        const sortedCountries = data.map(c => ({ value: c.name.common, text: c.name.common })).sort((a, b) => a.text.localeCompare(b.text));
        countries.splice(0, countries.length, { value: '', text: 'Select a country' }, ...sortedCountries);
      } catch (e) {
        countries.splice(0, countries.length, { value: '', text: 'Select a country' });
      }
    });

    const register = async () => {
      console.log('Register function called');
      console.log('Validation state:', {
        invalid: v$.value.$invalid,
        dirty: v$.value.$dirty,
        pending: v$.value.$pending,
        errors: v$.value.$errors
      });
      
      //const valid = await v$.value.$validate();
      //console.log('Validation result:', valid);
      //console.log('Validation errors:', v$.value.$errors);
      
      //if (!valid) {
      //  console.log('Validation failed, not submitting');
      //  return;
      //}

      console.log('Validation passed, submitting form');
      state.submitError = null;
      
      try {
        await axios.post(store.server_domain + '/auth/register', {
          username: state.username,
          firstName: state.firstName,
          lastName: state.lastName,
          email: state.email,
          password: state.password,
          country: state.country,
        }, { withCredentials: true });
        
        alert('Registration successful! You can now login.');
        router.push('/login');
      } catch (err) {
        console.error('Registration error:', err);
        if (err.response?.status === 409) {
          state.submitError = 'Username already exists. Please choose another.';
        } else if (err.response?.status === 400) {
          state.submitError = err.response?.data?.message || 'Invalid registration data.';
        } else if (err.code === 'ERR_NETWORK') {
          state.submitError = 'Cannot connect to server. Please make sure the backend is running.';
        } else {
          state.submitError = err.response?.data?.message || 'Registration failed. Please try again.';
        }
      }
    };

    return {
      state,
      countries,
      register,
      v$,
    };
  },
};
</script>