<script setup>
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
const route = useRoute()
const auth = useAuthStore()
const { isAuthenticated } = storeToRefs(auth)
const breadcrumbs = useBreadcrumbs()
</script>
<template>
  <section v-if="isAuthenticated" class="manage">
    <Breadcrumbs v-if="route.name === 'manage-products'" :items="breadcrumbs" />
    <div class="manage__heading"><h1>Керування товарами</h1><RouterLink :to="{ name: 'manage-products' }">Усі товари</RouterLink></div>
    <p class="manage__notice">Зміни підтверджуються PATCH, але DummyJSON не зберігає їх назавжди. Вони діють лише до reload або виходу.</p>
    <RouterView />
  </section>
</template>
