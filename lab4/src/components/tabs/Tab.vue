<script setup>
import {
  inject,
  computed,
  onMounted,
  onBeforeUnmount,
  defineComponent,
  h,
  KeepAlive,
  useSlots
} from 'vue'

import { tabsKey } from './tabsKey.js'

const props = defineProps({
  slug: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  panel: {
    type: Object,
    default: null
  },
  panelProps: {
    type: Object,
    default: () => ({})
  }
})

const context = inject(tabsKey, null)

if (!context) {
  throw new Error('Компонент Tab повинен бути всередині Tabs')
}

const {
  activeSlug,
  idPrefix,
  registerTab,
  unregisterTab
} = context

const isActive = computed(
  () => activeSlug.value === props.slug
)

const slots = useSlots()

const SlotPanel = defineComponent({
  name: 'SlotPanel',
  setup() {
    return () => {
      const content = slots.default?.({
        isActive: isActive.value
      })

      return h('div', { class: 'tabs__slot-content' }, content)
    }
  }
})

onMounted(() => {
  registerTab({
    slug: props.slug,
    title: props.title,
    disabled: props.disabled
  })
})

onBeforeUnmount(() => {
  unregisterTab(props.slug)
})
</script>
<template>
  <section
    v-show="isActive"
    :id="`${idPrefix}-panel-${slug}`"
    class="tabs__panel"
    role="tabpanel"
    :aria-labelledby="`${idPrefix}-tab-${slug}`"
    tabindex="0"
  >
    <KeepAlive>
      <component
        :is="$slots.default ? SlotPanel : panel"
        v-if="isActive && ($slots.default || panel)"
        v-bind="$slots.default ? {} : panelProps"
        :key="slug"
      />
    </KeepAlive>
  </section>
</template>
<style scoped lang="scss">
.tabs__panel {
  @apply min-w-0 rounded-xl bg-paper p-5;
  @apply border border-edge;
  @apply text-ink;

  &:focus-visible {
    @apply outline outline-2 outline-accent;
  }
}
</style>