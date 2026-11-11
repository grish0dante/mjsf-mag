
<script setup>
import {
  computed,
  onUnmounted,
  ref,
  watch,
} from 'vue'

import { useRoute, useRouter } from 'vue-router'

import ProductSearchForm from '../components/ProductSearchForm.vue'
import ProductCatalog from '../components/ProductCatalog.vue'
import CatalogLoadMore from '../components/CatalogLoadMore.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'

import { useFetch } from '../composables/useFetch.js'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useProductsStore } from '../stores/products.js'

import {
  PAGE_SIZE,
  createProductsUrl,
} from '../api/products.js'

const route = useRoute()
const router = useRouter()

const breadcrumbs = useBreadcrumbs()
const productsStore = useProductsStore()
const visibleProducts = computed(() => products.value.map(item => productsStore.merge(item)))

// Підтверджене значення пошуку з URL
const confirmedQuery = computed(() => {
  return typeof route.query.q === 'string'
    ? route.query.q
    : ''
})

// Чернетка введення
const query = ref(confirmedQuery.value)

// Стан каталогу
const skip = ref(0)
const products = ref([])
const total = ref(0)

// Локальний стан редагування
const isDebouncing = ref(false)
let debounceTimer = null
let editVersion = 0
let cancelledRequest = false

const requestUrl = computed(() => {
  return createProductsUrl(
    confirmedQuery.value,
    skip.value,
  )
})

const {
  data,
  error,
  isLoading,
  abort,
  refetch,
} = useFetch(requestUrl)

// Отримання сторінки товарів
watch(data, (page) => {
  if (!page || isDebouncing.value) return

  if (skip.value === 0) {
    products.value = [...page.products]
  } else {
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

const hasMore = computed(() => {
  return products.value.length < total.value
})

// Зміна підтвердженого пошуку в URL
watch(
  confirmedQuery,
  (newQuery) => {
    clearTimeout(debounceTimer)
    editVersion++
    isDebouncing.value = false
    cancelledRequest = false

    query.value = newQuery
    skip.value = 0
    products.value = []
    total.value = 0
  },
  { flush: 'sync' },
)

// Обробка введення користувача
function updateQuery(value) {
  query.value = value

  clearTimeout(debounceTimer)
  editVersion++

  const currentEdit = editVersion

  isDebouncing.value = true

  if (isLoading.value) {
    abort()
    cancelledRequest = true
  }

  debounceTimer = setTimeout(async () => {
    if (currentEdit !== editVersion) return

    const nextQuery = query.value.trim()

    if (nextQuery !== confirmedQuery.value) {
      const nextQueryParams = nextQuery
        ? { q: nextQuery }
        : {}

      const failure = await router.replace({
        name: 'products',
        query: nextQueryParams,
      })

      // Якщо перехід не відбувся, не залишаємо
      // інтерфейс у стані очікування.
      if (currentEdit === editVersion) {
        isDebouncing.value = false

        if (failure && cancelledRequest) {
          cancelledRequest = false
          refetch()
        }
      }
    } else {
      // URL не змінився, але старий запит
      // міг бути скасований під час редагування.
      isDebouncing.value = false

      if (cancelledRequest) {
        cancelledRequest = false
        refetch()
      }
    }
  }, 400)
}

function loadMore() {
  if (!hasMore.value) return
  if (isLoading.value) return
  if (isDebouncing.value) return
  if (error.value) return

  skip.value += PAGE_SIZE
}

function retry() {
  if (isDebouncing.value) return

  cancelledRequest = false
  refetch()
}

onUnmounted(() => {
  clearTimeout(debounceTimer)
  abort()
})
</script>

<template>
  <div class="catalog-view">
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
        :model-value="query"
        :loaded="products.length"
        :total="total"
        :is-loading="isLoading"
        :error="error"
        :is-debouncing="isDebouncing"
        @update:model-value="updateQuery"
      />
    </section>

    <Breadcrumbs :items="breadcrumbs" />

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
            confirmedQuery
              ? 'Результати пошуку'
              : 'Початкова добірка'
          }}
        </h2>

        <span class="catalog__count">
          {{ String(products.length).padStart(2, '0') }}
        </span>
      </div>

      <ProductCatalog
        :products="visibleProducts"
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
  </div>
</template>
