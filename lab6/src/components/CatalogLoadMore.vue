
<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver.js'

const props = defineProps({
  loaded: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    default: null,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load-more', 'retry'])

const loadMoreMarker = ref(null)

useIntersectionObserver(
  loadMoreMarker,
  () => {
    if (props.hasMore && !props.isLoading && !props.error) {
      emit('load-more')
    }
  },
  {
    rootMargin: '280px 0px',
    threshold: 0.01,
  },
)
</script>

<template>
  <div
    ref="loadMoreMarker"
    class="catalog__load-more"
  >
    <span class="catalog__load-progress">
      {{ loaded }} / {{ total }}
    </span>

    <div class="catalog__load-copy">
      <span
        v-if="isLoading"
        class="catalog__load-spinner"
        aria-hidden="true"
      ></span>

      <template v-if="error">
        <strong class="catalog__load-title">
          Не вдалося завантажити наступну сторінку
        </strong>

        <button
          class="catalog__load-button"
          type="button"
          @click="emit('retry')"
        >
          Повторити
        </button>
      </template>

      <template v-else-if="isLoading">
        <strong class="catalog__load-title">
          Завантажуємо ще товари…
        </strong>

        <span class="catalog__load-text">
          Отримуємо наступну сторінку каталогу
        </span>
      </template>

      <template v-else-if="hasMore">
        <strong class="catalog__load-title">
          Продовжуйте перегляд
        </strong>

        <span class="catalog__load-text">
          Наступні товари завантажаться автоматично
        </span>

        <button
          class="catalog__load-button"
          type="button"
          @click="emit('load-more')"
        >
          Завантажити ще
        </button>
      </template>

      <template v-else>
        <strong class="catalog__load-title">
          Усі товари завантажено
        </strong>

        <span class="catalog__load-text">
          Ви переглянули всі доступні результати
        </span>
      </template>
    </div>
  </div>
</template>
