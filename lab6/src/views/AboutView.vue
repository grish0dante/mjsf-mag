
<script setup>
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <section class="info-page">
    <Breadcrumbs :items="breadcrumbs" />

    <p class="info-page__eyebrow">
      FORMA / ABOUT
    </p>

    <h1 class="info-page__title">
      Про застосунок
    </h1>

    <p class="info-page__lead">
      FORMA — навчальний каталог товарів,
      розроблений на Vue 3 із використанням
      Vue Router та Composition API.
    </p>

    <div class="info-page__details">
      <div>
        <span>Лабораторна робота</span>
        <strong>№6 — Vue Router</strong>
      </div>

      <div>
        <span>Технології</span>
        <strong>Vue 3, Vite, JavaScript</strong>
      </div>

      <div>
        <span>Маршрутизатор</span>
        <strong>Vue Router 4.6.4</strong>
      </div>

      <div>
        <span>Джерело даних</span>
        <strong>DummyJSON API</strong>
      </div>
    </div>

    <RouterLink
      class="info-page__button"
      :to="{ name: 'products' }"
    >
      Перейти до каталогу
    </RouterLink>
  </section>
</template>
