<script setup>
import { computed, ref } from 'vue'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useProductsStore } from '../stores/products.js'
const productsStore = useProductsStore()
const skip = ref(0)
const path = computed(() => `/auth/products?limit=12&skip=${skip.value}`)
const { data, error, isLoading, refetch } = usePrivateResource(path)
const items = computed(() => (data.value?.products || []).map(item => productsStore.merge(item)))
const total = computed(() => data.value?.total || 0)
function changePage(direction) {
  if (isLoading.value) return
  skip.value = Math.max(0, skip.value + direction * 12)
}
</script>
<template>
  <section class="manage__section">
    <h2>Список товарів</h2>
    <p v-if="isLoading" role="status">Завантаження…</p>
    <div v-else-if="error" role="alert"><p>{{ error.message }}</p><button @click="refetch">Повторити</button></div>
    <div v-else-if="data">
      <div class="manage__table-wrap"><table class="manage__table">
        <thead><tr><th>Назва</th><th>Ціна ($)</th><th>Залишок</th><th>Дія</th></tr></thead>
        <tbody><tr v-for="product in items" :key="product.id">
          <td>{{ product.title }}</td><td>{{ product.price }}</td><td>{{ product.stock }}</td>
          <td><RouterLink :to="{ name: 'manage-edit', params: { id: product.id } }">Редагувати</RouterLink></td>
        </tr></tbody>
      </table></div>
      <div class="manage__pagination">
        <button :disabled="isLoading || skip === 0" @click="changePage(-1)">← Попередня</button>
        <span>{{ skip + 1 }}–{{ Math.min(skip + 12, total) }} із {{ total }}</span>
        <button :disabled="isLoading || skip + 12 >= total" @click="changePage(1)">Наступна →</button>
      </div>
    </div>
  </section>
</template>
