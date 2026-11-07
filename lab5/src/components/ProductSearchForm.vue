
<script setup>
import { API_DELAY } from '../api/products.js'

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  loaded: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    default: null,
  },
  isDebouncing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

function updateSearch(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <form
    class="search-panel"
    role="search"
    @submit.prevent
  >
    <label
      class="search-panel__label"
      for="product-search"
    >
      Пошук у каталозі
    </label>

    <div class="search-panel__control">
      <svg
        class="search-panel__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>

      <input
        id="product-search"
        class="search-panel__input"
        type="search"
        :value="modelValue"
        placeholder="Введіть назву товару..."
        autocomplete="off"
        @input="updateSearch"
      />

      <span class="search-panel__hint">
        LIVE
      </span>
    </div>

    <p class="search-panel__status" aria-live="polite">
      <span
        class="search-panel__status-dot"
        :class="{
          'search-panel__status-dot--active':
            isLoading || isDebouncing
        }"
      ></span>

      <span v-if="isDebouncing">
        Очікування завершення введення…
      </span>

      <span v-else-if="isLoading">
        Завантаження товарів…
      </span>

      <span v-else-if="error">
        Помилка отримання даних
      </span>

      <span v-else>
        Показано {{ loaded }} із {{ total }} товарів
      </span>

      <span class="search-panel__delay">
        API +{{ API_DELAY }} мс
      </span>
    </p>
  </form>
</template>
