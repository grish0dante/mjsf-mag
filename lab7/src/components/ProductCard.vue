
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const route = useRoute()

const productLink = computed(() => ({
  name: 'product-overview',
  params: {
    id: props.product.id,
  },
  query: typeof route.query.q === 'string'
    ? { q: route.query.q }
    : {},
}))

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(props.product.price)
})
</script>

<template>
  <article class="product-card">
    <div class="product-card__visual">
      <span
        v-if="product.discountPercentage >= 10"
        class="product-card__discount"
      >
        −{{ Math.round(product.discountPercentage) }}%
      </span>

      <RouterLink
        class="product-card__image-link"
        :to="productLink"
        :aria-label="`Відкрити товар ${product.title}`"
      >
        <img
          class="product-card__image"
          :src="product.thumbnail"
          :alt="product.title"
          loading="lazy"
          width="420"
          height="320"
        />
      </RouterLink>
    </div>

    <div class="product-card__body">
      <div class="product-card__meta">
        <span class="product-card__category">
          {{ product.category }}
        </span>

        <span class="product-card__rating">
          {{ product.rating.toFixed(1) }} / 5
        </span>
      </div>

      <h3 class="product-card__title">
        <RouterLink
          class="product-card__title-link"
          :to="productLink"
        >
          {{ product.title }}
        </RouterLink>
      </h3>

      <p class="product-card__description">
        {{ product.description }}
      </p>

      <div class="product-card__footer">
        <strong class="product-card__price">
          {{ formattedPrice }}
        </strong>

        <span class="product-card__stock">
          У наявності · {{ product.stock }}
        </span>
      </div>
    </div>
  </article>
</template>
