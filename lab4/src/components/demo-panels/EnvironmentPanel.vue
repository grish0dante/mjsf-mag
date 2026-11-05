<script setup>
import { ref } from 'vue'
import ModalDialog from '../ModalDialog.vue'

defineProps({
  heading: {
    type: String,
    default: 'Середовище розробки'
  }
})

const isModalOpen = ref(false)
const comment = ref('')
const visits = ref(0)
</script>

<template>
  <div class="environment">
    <h3 class="environment__title">{{ heading }}</h3>

    <p>Фреймворк: Vue 3</p>
    <p>Мова: JavaScript</p>
    <p>Збірка: Vite</p>
    <p>Стилі: Tailwind CSS + SCSS</p>

    <label class="environment__label">
      Коментар
      <input
        v-model="comment"
        class="environment__input"
        placeholder="Ваш коментар"
      />
    </label>

    <p>Коментар: {{ comment }}</p>

    <button
      class="environment__button"
      @click="visits++"
    >
      Лічильник: {{ visits }}
    </button>

    <button
      class="environment__button"
      @click="isModalOpen = true"
    >
      Відкрити модальне вікно
    </button>

    <ModalDialog
      :open="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped lang="scss">
.environment {
  @apply space-y-4;

  &__title {
    @apply text-xl font-semibold;
  }

  &__label {
    @apply block space-y-2;
  }

  &__input {
    @apply block w-full rounded-lg border border-edge p-3;
  }

  &__button {
    @apply mr-2 rounded-lg bg-deep px-5 py-3;
    @apply font-semibold text-paper;
  }
}
</style>