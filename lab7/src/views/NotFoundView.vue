
<script setup>
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <section class="info-page info-page--404">
    <Breadcrumbs :items="breadcrumbs" />

    <p class="info-page__eyebrow">
      ERROR / NOT FOUND
    </p>

    <div class="info-page__error-code">
      404
    </div>

    <h1 class="info-page__title">
      Сторінку не знайдено
    </h1>

    <p class="info-page__lead">
      Такої адреси немає в нашому каталозі.
      Можливо, сторінку було переміщено
      або посилання містить помилку.
    </p>

    <RouterLink
      class="info-page__button"
      :to="{ name: 'products' }"
    >
      Повернутися до каталогу
    </RouterLink>
  </section>
</template>
