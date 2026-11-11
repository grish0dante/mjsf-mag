
<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    default: null,
  },
})

const emit = defineEmits(['retry'])
</script>

<template>
  <div
    v-if="products.length > 0"
    class="catalog__grid"
  >
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>

  <div
    v-else-if="isLoading"
    class="catalog__skeletons"
    aria-hidden="true"
  >
    <div
      v-for="item in 6"
      :key="item"
      class="catalog__skeleton"
    ></div>
  </div>

  <div
    v-else-if="error"
    class="catalog__message catalog__message--error"
  >
    <p class="catalog__message-index">
      ERR / API
    </p>

    <h2 class="catalog__message-title">
      Каталог тимчасово недоступний
    </h2>

    <p class="catalog__message-text">
      {{ error.message || 'Помилка завантаження товарів' }}
    </p>

    <button
      class="catalog__retry"
      type="button"
      @click="emit('retry')"
    >
      Повторити запит
    </button>
  </div>

  <div
    v-else
    class="catalog__message"
  >
    <p class="catalog__message-index">
      00 / RESULTS
    </p>

    <h2 class="catalog__message-title">
      Товарів не знайдено
    </h2>

    <p class="catalog__message-text">
      Спробуйте змінити пошуковий запит
      або очистити поле пошуку.
    </p>
  </div>
</template>
s