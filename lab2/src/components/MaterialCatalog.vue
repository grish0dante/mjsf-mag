
<script setup>
import { ref, reactive, computed } from 'vue'

import { materials } from '../data/materials.js'

import MaterialCard from './MaterialCard.vue'
import MaterialFilterForm from './MaterialFilterForm.vue'

// Застосовані фільтри каталогу
const activeFilters = reactive({
  query: '',
  topic: 'all'
})

// Початково вибрано перший матеріал
const selectedTitle = ref(materials[0]?.title ?? '')

// Застосування фільтрів
function applyFilters(payload) {
  activeFilters.query = payload.query
  activeFilters.topic = payload.topic
}

// Очищення фільтрів
function clearFilters() {
  activeFilters.query = ''
  activeFilters.topic = 'all'
}

// Відфільтровані матеріали
const filteredMaterials = computed(() => {
  const query = activeFilters.query.toLowerCase()

  return materials.filter((material) => {
    const matchesQuery = material.title
      .toLowerCase()
      .includes(query)

    const matchesTopic =
      activeFilters.topic === 'all' ||
      material.topic === activeFilters.topic

    return matchesQuery && matchesTopic
  })
})

// Загальна тривалість
const totalMinutes = computed(() => {
  return filteredMaterials.value.reduce(
    (sum, material) => sum + material.minutes,
    0
  )
})
</script>

<template>
  <section
    class="material-catalog"
    aria-labelledby="catalog-title"
  >
    <div class="material-catalog__heading">
      <div>
        <h2
          class="material-catalog__title"
          id="catalog-title"
        >
          Каталог матеріалів
        </h2>
      </div>

      <p class="material-catalog__summary">
        <strong class="material-catalog__count">
          Знайдено: {{ filteredMaterials.length }}
        </strong>

        <span aria-hidden="true">·</span>

        Загальна тривалість:
        {{ totalMinutes }} хв
      </p>
    </div>

    <MaterialFilterForm
      @apply="applyFilters"
      @clear="clearFilters"
    />

    <p class="selection-status" aria-live="polite">
      <span class="selection-status__label">
        Обраний матеріал
      </span>

      <strong class="selection-status__value">
        {{ selectedTitle }}
      </strong>
    </p>

    <div
      v-if="filteredMaterials.length > 0"
      class="material-list"
    >
      <MaterialCard
        v-for="material in filteredMaterials"
        :key="material.id"
        :number="material.id"
        :title="material.title"
        :topic="material.topic"
        :description="material.description"
        :minutes="material.minutes"
        :selected="selectedTitle === material.title"
        @select="selectedTitle = $event"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>
  </section>
</template>
