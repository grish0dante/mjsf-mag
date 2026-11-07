
<script setup>
import { computed, ref, watch } from 'vue'

import ProductSearchForm from './components/ProductSearchForm.vue'
import ProductCatalog from './components/ProductCatalog.vue'
import CatalogLoadMore from './components/CatalogLoadMore.vue'

import { useFetch } from './composables/useFetch.js'
import { useDebouncedValue } from './composables/useDebouncedValue.js'

import {
  PAGE_SIZE,
  createProductsUrl,
} from './api/products.js'

// Початковий стан
const query = ref('')
const skip = ref(0)
const products = ref([])
const total = ref(0)

// Debounce 400 мс
const debouncedQuery = useDebouncedValue(query, 400)

// Чи очікується завершення введення
const isDebouncing = computed(
  () => query.value !== debouncedQuery.value,
)

// Скидання попереднього пошуку
watch(
  debouncedQuery,
  () => {
    skip.value = 0
    products.value = []
    total.value = 0
  },
  { flush: 'sync' },
)

// Формування реактивного URL
const requestUrl = computed(() => {
  return createProductsUrl(
    debouncedQuery.value,
    skip.value,
  )
})

// HTTP-запит
const {
  data,
  error,
  isLoading,
  abort,
  refetch,
} = useFetch(requestUrl)

// Негайне скасування активного запиту
watch(
  query,
  () => {
    abort()
  },
  { flush: 'sync' },
)

// Обробка відповіді API
watch(data, (page) => {
  if (!page) return

  // Не приймаємо відповідь під час введення
  if (isDebouncing.value) return

  if (skip.value === 0) {
    // Перша сторінка замінює попередні товари
    products.value = [...page.products]
  } else {
    // Наступні сторінки додаються без дублікатів
    const existingIds = new Set(
      products.value.map(product => product.id),
    )

    const uniqueProducts = page.products.filter(
      product => !existingIds.has(product.id),
    )

    products.value = [
      ...products.value,
      ...uniqueProducts,
    ]
  }

  total.value = page.total
}, { flush: 'sync' })

// Чи залишилися товари
const hasMore = computed(() => {
  return products.value.length < total.value
})

// Чи можна завантажити наступну сторінку
function loadMore() {
  if (!hasMore.value) return
  if (isLoading.value) return
  if (isDebouncing.value) return
  if (error.value) return

  skip.value += PAGE_SIZE
}

// Повторення запиту після помилки
function retry() {
  if (isDebouncing.value) return

  refetch()
}
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <a
        class="storefront__brand"
        href="#"
        aria-label="Forma, на початок"
      >
        FORMA<span class="storefront__brand-mark">®</span>
      </a>

      <p class="storefront__edition">
        Лабораторна / 05
      </p>

      <p class="storefront__note">
        Каталог і composables
      </p>
    </header>

    <section class="storefront__hero">
      <div class="storefront__intro">
        <p class="storefront__eyebrow">
          Реактивний каталог товарів
        </p>

        <h1 class="storefront__title">
          Речі з ясною
          <em class="storefront__title-accent">
            формою
          </em>
        </h1>
      </div>

      <ProductSearchForm
        v-model="query"
        :loaded="products.length"
        :total="total"
        :is-loading="isLoading"
        :error="error"
        :is-debouncing="isDebouncing"
      />
    </section>

    <section
      class="catalog"
      aria-labelledby="catalog-title"
    >
      <div class="catalog__heading">
        <h2
          id="catalog-title"
          class="catalog__title"
        >
          {{
            debouncedQuery
              ? 'Результати пошуку'
              : 'Початкова добірка'
          }}
        </h2>

        <span class="catalog__count">
          {{ products.length.toString().padStart(2, '0') }}
        </span>
      </div>

      <ProductCatalog
        :products="products"
        :is-loading="isLoading || isDebouncing"
        :error="isDebouncing ? null : error"
        @retry="retry"
      />

      <CatalogLoadMore
        v-if="products.length > 0 && !isDebouncing"
        :loaded="products.length"
        :total="total"
        :is-loading="isLoading"
        :error="error"
        :has-more="hasMore"
        @load-more="loadMore"
        @retry="retry"
      />
    </section>

    <footer class="storefront__footer">
      <div>
        <p>Студент:Грішанов Данило Євгенович</p>
        <p>Група: 7.F2.25-2</p>
        <p>Node.js 22.15.1</p>
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
