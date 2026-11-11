
<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth.js'
import { useProductsStore } from './stores/products.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
useProductsStore()
const { user, isAuthenticated } = storeToRefs(auth)
let explicitLogout = false
watch(() => auth.status, status => {
  if (status === 'guest' && route.meta.requiresAuth && !explicitLogout) {
    router.replace({ name: 'login', query: { redirect: route.fullPath } })
  }
}, { flush: 'sync' })
async function logout() {
  explicitLogout = true
  auth.logout()
  if (route.meta.requiresAuth) await router.replace({ name: 'products' })
  explicitLogout = false
}

const catalogLink = computed(() => ({
  name: 'products',
  query: typeof route.query.q === 'string'
    ? { q: route.query.q }
    : {},
}))
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <RouterLink
        class="storefront__brand"
        :to="catalogLink"
        aria-label="FORMA — каталог"
      >
        FORMA<span class="storefront__brand-mark">®</span>
      </RouterLink>

      <p class="storefront__edition">
        Лабораторна / 07
      </p>

      <nav
        class="storefront__main-nav"
        aria-label="Головна навігація"
      >
        <RouterLink :to="catalogLink">
          Каталог
        </RouterLink>

        <RouterLink :to="{ name: 'about' }">Про застосунок</RouterLink>
        <RouterLink v-if="isAuthenticated" :to="{ name: 'manage-products' }">Керування</RouterLink>
        <RouterLink v-else :to="{ name: 'login' }">Увійти</RouterLink>
        <span v-if="isAuthenticated" class="storefront__user">{{ user?.firstName || user?.username }}</span>
        <button v-if="isAuthenticated" class="storefront__logout" type="button" @click="logout">Вийти</button>
      </nav>
    </header>

    <RouterView />

    <footer class="storefront__footer">
      <div>
        <p>Студент: Грішанов Данило Євгенович</p>
        <p>Група: 7.F2.25-2</p>
        <p>Vue 3 · Vue Router 4.6.4 · Vite</p>
        <p>Node.js 22.15.1 · npm · Windows</p>
      </div>

      <a
        href="https://dummyjson.com/docs/products"
        target="_blank"
        rel="noreferrer"
      >
        Дані: DummyJSON
      </a>
    </footer>
  </main>
</template>
