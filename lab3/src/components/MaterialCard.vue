
<script setup>
defineProps({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  minutes: { type: Number, required: true },
  selected: { type: Boolean, default: false }
})

const emit = defineEmits([
  'select',
  'edit',
  'delete'
])
</script>

<template>
  <article
    class="material-card"
    :class="[
      `material-card--${topic}`,
      { 'material-card--selected': selected }
    ]"
  >
    <div class="material-card__meta">
      <span class="material-card__number">
        {{ String($attrs.number ?? 1).padStart(2, '0') }}
      </span>
      <span class="material-card__topic">
        {{ topic }}
      </span>
    </div>

    <h3 class="material-card__title">
      {{ title }}
    </h3>

    <p class="material-card__description">
      {{ description }}
    </p>

    <div class="material-card__footer">
      <span class="material-card__duration">
        {{ minutes }} хв
      </span>

      <button
        type="button"
        class="material-card__action"
        :aria-pressed="selected"
        @click="emit('select')"
      >
        {{ selected ? 'Обрано ✓' : 'Обрати ↗' }}
      </button>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
      <button
        type="button"
        class="min-h-11 flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        @click="emit('edit')"
      >
        Редагувати
      </button>

      <button
        type="button"
        class="min-h-11 flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        @click="emit('delete')"
      >
        Видалити
      </button>
    </div>
  </article>
</template>
