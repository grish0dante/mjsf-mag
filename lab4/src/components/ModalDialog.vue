
<script setup>
import {
  ref,
  watch,
  nextTick,
  onBeforeUnmount
} from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  initialFocus: {
    default: null
  },
  fallbackFocus: {
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const panel = ref(null)
const titleId = 'material-dialog-title'

let previousFocus = null
let previousOverflow = ''
let previousInert = false
let backgroundLocked = false

function close() {
  emit('update:modelValue', false)
}

function isUsable(element) {
  return element instanceof HTMLElement &&
    element.isConnected &&
    !element.matches(':disabled') &&
    element.getClientRects().length > 0 &&
    !element.closest('[inert]')
}

function focusInside() {
  const target = props.initialFocus

  if (isUsable(target)) {
    target.focus()
  } else {
    panel.value?.focus()
  }
}

function lockBackground() {
  if (backgroundLocked) return

  const app = document.getElementById('app')

  previousOverflow = document.body.style.overflow
  previousInert = app?.inert ?? false

  backgroundLocked = true

  document.body.style.overflow = 'hidden'

  if (app) {
    app.inert = true
  }
}

function unlockBackground(restoreFocus = true) {
  if (!backgroundLocked) return

  const app = document.getElementById('app')

  if (app) {
    app.inert = previousInert
  }

  document.body.style.overflow = previousOverflow
  backgroundLocked = false

  if (restoreFocus) {
    const target = isUsable(previousFocus)
      ? previousFocus
      : props.fallbackFocus

    if (isUsable(target)) {
      target.focus()
    }
  }

  previousFocus = null
}

function handleTab(event) {
  if (event.key !== 'Tab' || !panel.value) return

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',')

  const elements = Array.from(
    panel.value.querySelectorAll(selector)
  ).filter(el =>
    isUsable(el) &&
    el.tabIndex >= 0 &&
    getComputedStyle(el).visibility !== 'hidden'
  )

  if (!elements.length) {
    event.preventDefault()
    panel.value.focus()
    return
  }

  const first = elements[0]
  const last = elements[elements.length - 1]
  const active = document.activeElement

  if (event.shiftKey) {
    if (active === first ||
        !panel.value.contains(active) ||
        active === panel.value) {
      event.preventDefault()
      last.focus()
    }
  } else {
    if (active === last ||
        !panel.value.contains(active) ||
        active === panel.value) {
      event.preventDefault()
      first.focus()
    }
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    close()
    return
  }

  handleTab(event)
}

function afterEnter() {
  if (props.modelValue) {
    focusInside()
  }
}

function afterLeave() {
  if (!props.modelValue) {
    unlockBackground()
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      // Запам'ятовуємо кнопку, яка відкрила діалог
      previousFocus = document.activeElement

      await nextTick()

      if (!props.modelValue) return

      // Спочатку переводимо фокус у діалог
      focusInside()

      // Потім блокуємо основний застосунок
      lockBackground()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  unlockBackground()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0"
      enter-active-class="transition-opacity duration-150 motion-reduce:transition-none"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-active-class="transition-opacity duration-150 motion-reduce:transition-none"
      leave-to-class="opacity-0"
      @after-enter="afterEnter"
      @after-leave="afterLeave"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 box-border flex items-center justify-center overflow-y-auto bg-black/60 p-4"
        @click.self="close"
        @keydown="handleKeydown"
      >
        <section
            ref="panel"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            tabindex="-1"
            class="box-border flex w-full max-w-[640px] max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl"
        >
          <header
            class="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-5"
          >
            <h2
              :id="titleId"
              class="min-w-0 break-words text-xl font-semibold"
            >
              {{ title }}
            </h2>

            <button
              type="button"
              aria-label="Закрити вікно"
              class="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-2xl hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              @click="close"
            >
              &times;
            </button>
          </header>

          <div
            class="min-h-0 overflow-y-auto break-words p-5"
          >
            <slot />
          </div>

          <footer
            class="flex shrink-0 flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:justify-end sm:p-5"
            >
            <slot name="footer" :close="close" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
