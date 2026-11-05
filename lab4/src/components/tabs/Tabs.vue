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

const emit = defineEmits(['update:modelValue'])

const tabs = ref([])
const idPrefix = useId()

const activeSlug = computed(() => props.modelValue)

const availableTabs = computed(() =>
  tabs.value.filter(tab => !tab.disabled)
)

function setActiveTab(slug) {
  const tab = tabs.value.find(item => item.slug === slug)

  if (!tab || tab.disabled) return

  if (props.modelValue !== slug) {
    emit('update:modelValue', slug)
  }
}

function registerTab(tab) {
  if (tabs.value.some(item => item.slug === tab.slug)) {
    throw new Error(`Повторний slug вкладки: ${tab.slug}`)
  }

  tabs.value.push(tab)

  if (
    !tabs.value.some(
      item => item.slug === props.modelValue && !item.disabled
    )
  ) {
    const first = availableTabs.value[0]
    if (first) setActiveTab(first.slug)
  }
}

function unregisterTab(slug) {
  tabs.value = tabs.value.filter(tab => tab.slug !== slug)

  if (props.modelValue === slug) {
    const first = availableTabs.value[0]
    if (first) emit('update:modelValue', first.slug)
  }
}

watch(
  () => props.modelValue,
  slug => {
    if (!tabs.value.length) return

    const valid = tabs.value.some(
      tab => tab.slug === slug && !tab.disabled
    )

    if (!valid && availableTabs.value.length) {
      setActiveTab(availableTabs.value[0].slug)
    }
  }
)

provide(tabsKey, {
  activeSlug: readonly(activeSlug),
  idPrefix,
  setActiveTab,
  registerTab,
  unregisterTab
})

const buttons = ref([])

async function focusTab(slug) {
  setActiveTab(slug)
  await nextTick()

  const index = tabs.value.findIndex(tab => tab.slug === slug)
  buttons.value[index]?.focus()
}

function handleKeydown(event, slug) {
  const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']

  if (!keys.includes(event.key)) return

  event.preventDefault()

  const list = availableTabs.value
  if (!list.length) return

  const index = list.findIndex(tab => tab.slug === slug)
  let nextIndex = index

  if (event.key === 'ArrowRight') {
    nextIndex = (index + 1) % list.length
  }

  if (event.key === 'ArrowLeft') {
    nextIndex = (index - 1 + list.length) % list.length
  }

  if (event.key === 'Home') {
    nextIndex = 0
  }

  if (event.key === 'End') {
    nextIndex = list.length - 1
  }

  focusTab(list[nextIndex].slug)
}
</script>

<template>
  <div
    class="tabs"
    :class="{
      'tabs--underline': variant === 'underline',
      'tabs--pills': variant === 'pills',
      'tabs--boxed': variant === 'boxed'
    }"
  >
    <div
      class="tabs__list"
      role="tablist"
      aria-label="Навігація вкладками"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="tab.slug"
        :ref="el => buttons[index] = el"
        type="button"
        role="tab"
        class="tabs__tab"
        :class="{
          'tabs__tab--active': activeSlug === tab.slug
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
    @apply font-semibold text-muted;
    @apply transition-colors duration-200;
    @apply border-0 bg-transparent;

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

  &--pills {
    .tabs__tab {
      @apply rounded-full bg-surface;

      &--active {
        @apply bg-deep text-paper;
      }
    }
  }

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