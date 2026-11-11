
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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
        Лабораторна / 06
      </p>

      <nav
        class="storefront__main-nav"
        aria-label="Головна навігація"
      >
        <RouterLink :to="catalogLink">
          Каталог
        </RouterLink>

        <RouterLink :to="{ name: 'about' }">
          Про застосунок
        </RouterLink>
      </nav>
    </header>

    <RouterView />

    <footer class="storefront__footer">
      <div>
        <p>Студент: Прізвище Ім'я</p>
        <p>Група: Ваша група</p>
        <p>Vue 3 · Vue Router 4.6.4 · Vite</p>
        <p>Node.js 24 LTS · npm · Windows</p>
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
