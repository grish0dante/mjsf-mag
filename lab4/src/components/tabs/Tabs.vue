
<script setup>
import {
  ref,
  computed,
  readonly,
  provide,
  useId,
  nextTick,
  watch
} from 'vue'

import { tabsKey } from './tabsKey.js'

// Пропси компонента
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'underline',
    validator: value =>
      ['underline', 'pills', 'boxed'].includes(value)
  }
})

// Подія для v-model
const emit = defineEmits(['update:modelValue'])

// Зареєстровані вкладки
const tabs = ref([])

// Унікальний префікс для ARIA
const idPrefix = useId()

// Поточна активна вкладка
const activeSlug = computed(() => props.modelValue)

// Доступні вкладки
const availableTabs = computed(() =>
  tabs.value.filter(tab => !tab.disabled)
)

// Посилання на кнопки вкладок
const buttons = ref({})

// Перемикання активної вкладки
function setActiveTab(slug) {
  const tab = tabs.value.find(
    item => item.slug === slug
  )

  if (!tab || tab.disabled) return

  if (props.modelValue !== slug) {
    emit('update:modelValue', slug)
  }
}

// Реєстрація вкладки
function registerTab(tab) {
  const exists = tabs.value.some(
    item => item.slug === tab.slug
  )

  if (exists) {
    throw new Error(
      `Вкладка зі slug "${tab.slug}" вже існує`
    )
  }

  tabs.value.push(tab)

  // Якщо активна вкладка не існує або недоступна
  const activeExists = tabs.value.some(
    item =>
      item.slug === props.modelValue &&
      !item.disabled
  )

  if (!activeExists && availableTabs.value.length) {
    setActiveTab(availableTabs.value[0].slug)
  }
}

// Видалення вкладки
function unregisterTab(slug) {
  tabs.value = tabs.value.filter(
    tab => tab.slug !== slug
  )

  delete buttons.value[slug]

  if (props.modelValue === slug) {
    const first = availableTabs.value[0]

    if (first) {
      emit('update:modelValue', first.slug)
    }
  }
}

// Перевірка modelValue при зміні
watch(
  () => props.modelValue,
  slug => {
    if (!tabs.value.length) return

    const valid = tabs.value.some(
      tab =>
        tab.slug === slug &&
        !tab.disabled
    )

    if (!valid && availableTabs.value.length) {
      setActiveTab(availableTabs.value[0].slug)
    }
  }
)

// Передавання контексту дочірнім Tab
provide(tabsKey, {
  activeSlug: readonly(activeSlug),
  idPrefix,
  setActiveTab,
  registerTab,
  unregisterTab
})

// Збереження посилання на кнопку
function setButtonRef(slug, element) {
  if (element) {
    buttons.value[slug] = element
  } else {
    delete buttons.value[slug]
  }
}

// Активація вкладки та встановлення фокуса
async function focusTab(slug) {
  setActiveTab(slug)

  await nextTick()

  const button = buttons.value[slug]

  if (button && !button.disabled) {
    button.focus()
  }
}

// Обробка клавіатурної навігації
function handleKeydown(event, slug) {
  const supportedKeys = [
    'ArrowRight',
    'ArrowLeft',
    'Home',
    'End'
  ]

  if (!supportedKeys.includes(event.key)) {
    return
  }

  event.preventDefault()

  const list = availableTabs.value

  if (!list.length) return

  const currentIndex = list.findIndex(
    tab => tab.slug === slug
  )

  if (currentIndex === -1) return

  let nextIndex = currentIndex

  switch (event.key) {
    case 'ArrowRight':
      // Наступна вкладка, циклічно
      nextIndex = (currentIndex + 1) % list.length
      break

    case 'ArrowLeft':
      // Попередня вкладка, циклічно
      nextIndex =
        (currentIndex - 1 + list.length) % list.length
      break

    case 'Home':
      // Перша доступна вкладка
      nextIndex = 0
      break

    case 'End':
      // Остання доступна вкладка
      nextIndex = list.length - 1
      break
  }

  focusTab(list[nextIndex].slug)
}
</script>

<template>
  <div
    class="tabs"
    :class="`tabs--${variant}`"
  >
    <!-- Панель навігації -->
    <div
      class="tabs__list"
      role="tablist"
      aria-label="Навігація вкладками"
    >
      <button
        v-for="tab in tabs"
        :key="tab.slug"
        :ref="el => setButtonRef(tab.slug, el)"
        type="button"
        role="tab"
        class="tabs__tab"
        :class="{
          'tabs__tab--active':
            activeSlug === tab.slug
        }"
        :id="`${idPrefix}-tab-${tab.slug}`"
        :aria-controls="`${idPrefix}-panel-${tab.slug}`"
        :aria-selected="activeSlug === tab.slug"
        :tabindex="activeSlug === tab.slug ? 0 : -1"
        :disabled="tab.disabled"
        @click="setActiveTab(tab.slug)"
        @keydown="handleKeydown($event, tab.slug)"
      >
        {{ tab.title }}
      </button>
    </div>

    <!-- Вміст вкладок -->
    <div class="tabs__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  @apply w-full min-w-0;

  &__list {
    @apply flex flex-wrap gap-2;
  }

  &__tab {
    @apply cursor-pointer px-5 py-3;
    @apply border-0 bg-transparent;
    @apply font-semibold text-muted;
    @apply transition-colors duration-200;

    &:hover:not(:disabled) {
      @apply text-ink;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-accent;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-40;
    }
  }

  &__content {
    @apply min-w-0 py-5;
  }

  // Underline
  &--underline {
    .tabs__list {
      @apply border-b border-edge;
    }

    .tabs__tab {
      @apply border-b-4 border-transparent;

      &--active {
        @apply border-accent text-ink;
      }
    }
  }

  // Pills
  &--pills {
    .tabs__tab {
      @apply rounded-full bg-surface;

      &--active {
        @apply bg-deep text-paper;
      }
    }
  }

  // Boxed
  &--boxed {
    .tabs__list {
      @apply rounded-xl bg-surface p-2;
    }

    .tabs__tab {
      @apply rounded-lg border border-transparent;

      &--active {
        @apply border-edge bg-paper text-ink shadow-sm;
      }
    }
  }
}
</style>
