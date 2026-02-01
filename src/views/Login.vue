<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="login">Login</label>
        <input id="login" v-model="login" type="text" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <div class="form-group checkbox">
        <input id="remember" v-model="remember" type="checkbox" />
        <label for="remember">Remember me</label>
      </div>
      <button type="submit">Login</button>
    </form>
    <RouterLink to="/register" class="register-link">Create new</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const login = ref("");
const password = ref("");
const remember = ref(false);

const auth = useAuthStore();

async function onSubmit() {
  await auth.login(login.value, password.value);
}
</script>

<style scoped>
.login-container {
  max-width: 350px;
  margin: 3rem auto;
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.3rem;
}
.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
.form-group.checkbox {
  display: flex;
  align-items: center;
}
.form-group.checkbox label {
  margin-left: 0.5rem;
  margin-bottom: 0;
}
button[type="submit"] {
  width: 100%;
  padding: 0.7rem;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.register-link {
  display: block;
  margin-top: 1rem;
  text-align: center;
  color: #42b983;
}
</style>
