<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { safeRedirect } from '../router/guards.js'
const auth = useAuthStore()
const { status, error, isBusy, isAuthenticated } = storeToRefs(auth)
const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
async function submit() {
  if (isBusy.value) return
  const secret = password.value
  password.value = ''
  if (await auth.login(username.value.trim(), secret)) await router.replace(safeRedirect(router, route.query.redirect))
}
async function retryRestore() {
  await auth.restore()
  if (auth.isAuthenticated) await router.replace(safeRedirect(router, route.query.redirect))
}
</script>
<template>
  <section class="manage manage--login">
    <p class="manage__eyebrow">FORMA / AUTH</p>
    <h1>Вхід до керування</h1>
    <p>Навчальний обліковий запис DummyJSON: <code>emilys</code> / <code>emilyspass</code>.</p>
    <p v-if="status === 'unavailable'" role="alert">{{ error }} <button type="button" @click="retryRestore">Повторити перевірку сеансу</button></p>
    <form class="manage__form" @submit.prevent="submit">
      <label for="login-username">Ім'я користувача</label>
      <input id="login-username" v-model="username" autocomplete="username" required :disabled="isBusy" />
      <label for="login-password">Пароль</label>
      <input id="login-password" v-model="password" type="password" autocomplete="current-password" required :disabled="isBusy" />
      <p v-if="error && status !== 'unavailable'" role="alert" class="manage__error">{{ error }}</p>
      <button type="submit" :disabled="isBusy || isAuthenticated">{{ isBusy ? 'Зачекайте…' : 'Увійти' }}</button>
    </form>
    <RouterLink v-if="isAuthenticated" :to="{ name: 'manage-products' }">Відкрити керування</RouterLink>
  </section>
</template>
