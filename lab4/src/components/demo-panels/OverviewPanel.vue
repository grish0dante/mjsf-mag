<script setup>
import { ref } from 'vue'

defineProps({
  heading: {
    type: String,
    default: 'Огляд'
  }
})

const note = ref('')
</script>

<template>
  <div class="overview">
    <h3 class="overview__title">{{ heading }}</h3>

    <p class="overview__description">
      Введіть текст, перейдіть на іншу вкладку,
      а потім поверніться.
      Текст повинен зберегтися.
    </p>

    <label class="overview__label" for="overview-note">
      Ваша нотатка
    </label>

    <textarea
      id="overview-note"
      v-model="note"
      class="overview__input"
      placeholder="Напишіть щось..."
      rows="4"
    />

    <p class="overview__result">
      Введено символів: {{ note.length }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.overview {
  @apply space-y-4;

  &__title {
    @apply text-xl font-semibold text-ink;
  }

  &__description {
    @apply text-muted;
  }

  &__label {
    @apply block font-semibold;
  }

  &__input {
    @apply w-full rounded-lg border border-edge;
    @apply bg-paper p-3 text-ink;
    @apply outline-none focus:border-accent;
  }

  &__result {
    @apply text-sm text-muted;
  }
}
</style>