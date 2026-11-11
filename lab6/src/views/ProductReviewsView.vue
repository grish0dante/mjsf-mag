
<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})

function formatDate(date) {
  if (!date) return 'Дата не вказана'

  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}
</script>

<template>
  <section class="product-reviews">
    <p class="product-page__eyebrow">
      PRODUCT / REVIEWS
    </p>

    <h2 class="product-reviews__heading">
      Відгуки покупців
    </h2>

    <div
      v-if="!product.reviews?.length"
      class="product-reviews__empty"
    >
      <h3>Відгуків поки немає</h3>
      <p>Для цього товару ще не залишили відгуків.</p>
    </div>

    <div
      v-else
      class="product-reviews__list"
    >
      <article
        v-for="(review, index) in product.reviews"
        :key="index"
        class="product-reviews__card"
      >
        <div class="product-reviews__top">
          <div>
            <h3 class="product-reviews__author">
              {{ review.reviewerName }}
            </h3>

            <time
              class="product-reviews__date"
              :datetime="review.date"
            >
              {{ formatDate(review.date) }}
            </time>
          </div>

          <span class="product-reviews__rating">
            ★ {{ review.rating }} / 5
          </span>
        </div>

        <p class="product-reviews__comment">
          {{ review.comment }}
        </p>
      </article>
    </div>
  </section>
</template>
