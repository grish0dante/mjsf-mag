
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useFetch } from '../composables/useFetch.js'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useProductsStore } from '../stores/products.js'

const route = useRoute()
const productsStore = useProductsStore()

const productId = computed(() => String(route.params.id ?? ''))

const isValidId = computed(() => {
  return /^[1-9]\d*$/.test(productId.value)
})

const productUrl = computed(() => {
  if (!isValidId.value) return null

  return `https://dummyjson.com/products/${productId.value}?delay=800`
})

const {
  data: product,
  error,
  isLoading,
  refetch,
} = useFetch(productUrl)

const shownProduct = computed(() => productsStore.merge(product.value))

const notFound = computed(() => {
  return !isValidId.value || error.value?.status === 404
})

const productTitle = computed(() => {
  if (notFound.value) return 'Товар не знайдено'

  return shownProduct.value?.title || `Товар №${productId.value}`
})

const breadcrumbs = useBreadcrumbs(productTitle)

const formattedPrice = computed(() => {
  if (!shownProduct.value) return ''

  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(shownProduct.value.price)
})

const navigationQuery = computed(() => {
  return typeof route.query.q === 'string'
    ? { q: route.query.q }
    : {}
})

const overviewLink = computed(() => ({
  name: 'product-overview',
  params: { id: productId.value },
  query: navigationQuery.value,
}))

const reviewsLink = computed(() => ({
  name: 'product-reviews',
  params: { id: productId.value },
  query: navigationQuery.value,
}))
</script>

<template>
  <section class="product-page">
    <Breadcrumbs :items="breadcrumbs" />

    <div
      v-if="!isValidId || notFound"
      class="product-page__state"
    >
      <p class="product-page__eyebrow">
        404 / PRODUCT
      </p>

      <h1 class="product-page__state-title">
        Товар не знайдено
      </h1>

      <p>
        Товар із таким ідентифікатором не існує.
      </p>

      <RouterLink
        class="product-page__back"
        :to="{ name: 'products', query: navigationQuery }"
      >
        Повернутися до каталогу
      </RouterLink>
    </div>

    <div
      v-else-if="isLoading"
      class="product-page__state"
      role="status"
    >
      <p class="product-page__eyebrow">
        LOADING / {{ productId }}
      </p>

      <h1 class="product-page__state-title">
        Завантаження товару…
      </h1>

      <p>Отримуємо інформацію з DummyJSON.</p>
    </div>

    <div
      v-else-if="error"
      class="product-page__state"
      role="alert"
    >
      <p class="product-page__eyebrow">
        ERR / API
      </p>

      <h1 class="product-page__state-title">
        Помилка завантаження
      </h1>

      <p>{{ error.message }}</p>

      <button
        class="product-page__back"
        type="button"
        @click="refetch"
      >
        Повторити запит
      </button>
    </div>

    <template v-else-if="shownProduct">
      <div class="product-page__hero">
        <div class="product-page__visual">
          <img
            class="product-page__image"
            :src="shownProduct.thumbnail"
            :alt="shownProduct.title"
          />
        </div>

        <div class="product-page__details">
          <p class="product-page__eyebrow">
            {{ shownProduct.category }} / №{{ shownProduct.id }}
          </p>

          <h1 class="product-page__title">
            {{ shownProduct.title }}
          </h1>

          <div class="product-page__price">
            {{ formattedPrice }}
          </div>

          <div class="product-page__facts">
            <p>
              <strong>Рейтинг</strong>
              {{ shownProduct.rating }} / 5
            </p>

            <p>
              <strong>Наявність</strong>
              {{
                shownProduct.stock > 0
                  ? `${shownProduct.stock} шт.`
                  : 'Немає в наявності'
              }}
            </p>

            <p>
              <strong>Бренд</strong>
              {{ shownProduct.brand || 'Не вказано' }}
            </p>

            <p>
              <strong>Знижка</strong>
              {{ shownProduct.discountPercentage }}%
            </p>
          </div>

          <RouterLink
            class="product-page__back"
            :to="{ name: 'products', query: navigationQuery }"
          >
            ← До каталогу
          </RouterLink>
        </div>
      </div>

      <nav
        class="product-page__navigation"
        aria-label="Розділи товару"
      >
        <RouterLink
          class="product-page__nav-link"
          :to="overviewLink"
          exact-active-class="router-link-exact-active"
        >
          Огляд товару
        </RouterLink>

        <RouterLink
          class="product-page__nav-link"
          :to="reviewsLink"
          exact-active-class="router-link-exact-active"
        >
          Відгуки
          <span>({{ shownProduct.reviews?.length ?? 0 }})</span>
        </RouterLink>
      </nav>

      <div class="product-page__content">
        <RouterView v-slot="{ Component }">
          <component
            :is="Component"
            :product="shownProduct"
          />
        </RouterView>
      </div>
    </template>
  </section>
</template>
