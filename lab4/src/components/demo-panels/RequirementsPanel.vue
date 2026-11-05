<script setup>
import { ref, computed } from 'vue'

const requirements = ref([
  { id: 1, title: 'Створити Tabs.vue', done: false },
  { id: 2, title: 'Створити Tab.vue', done: false },
  { id: 3, title: 'Реалізувати provide/inject', done: false },
  { id: 4, title: 'Додати KeepAlive', done: false }
])

const counter = ref(0)

const completed = computed(() =>
  requirements.value.filter(item => item.done).length
)
</script>

<template>
  <div class="requirements">
    <h3 class="requirements__title">Вимоги до роботи</h3>

    <p>Виконано: {{ completed }} / {{ requirements.length }}</p>

    <div class="requirements__list">
      <label
        v-for="item in requirements"
        :key="item.id"
        class="requirements__item"
      >
        <input type="checkbox" v-model="item.done" />
        <span>{{ item.title }}</span>
      </label>
    </div>

    <button
      class="requirements__button"
      @click="counter++"
    >
      Натиснуто: {{ counter }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.requirements {
  @apply space-y-4;

  &__title {
    @apply text-xl font-semibold;
  }

  &__list {
    @apply flex flex-col gap-3;
  }

  &__item {
    @apply flex items-center gap-3;
    @apply rounded-lg bg-surface p-3;
  }

  &__button {
    @apply rounded-lg bg-deep px-5 py-3;
    @apply font-semibold text-paper;
    @apply hover:opacity-90;
  }
}
</style>