<script setup>
import { ref, markRaw } from 'vue'

import Tabs from './components/tabs/Tabs.vue'
import Tab from './components/tabs/Tab.vue'

import OverviewPanel from './components/demo-panels/OverviewPanel.vue'
import RequirementsPanel from './components/demo-panels/RequirementsPanel.vue'
import EnvironmentPanel from './components/demo-panels/EnvironmentPanel.vue'

const activeUnderline = ref('overview')
const activePills = ref('notes')
const activeBoxed = ref('info')

const dynamicTabs = [
  {
    slug: 'notes',
    title: 'Нотатки',
    panel: markRaw(OverviewPanel),
    panelProps: {
      heading: 'Динамічна панель нотаток'
    }
  },
  {
    slug: 'tasks',
    title: 'Завдання',
    panel: markRaw(RequirementsPanel),
    panelProps: {}
  },
  {
    slug: 'environment',
    title: 'Середовище',
    panel: markRaw(EnvironmentPanel),
    panelProps: {
      heading: 'Динамічна панель середовища'
    }
  }
]
</script>

<template>
  <main class="page">
    <header class="page__header">
      <p class="page__eyebrow">
        Сучасні каркаси web-додатків
      </p>

      <h1 class="page__title">
        Лабораторна робота № 4
      </h1>

      <p class="page__subtitle">
        Slots, Provide/Inject, Dynamic Components і KeepAlive
      </p>

      <div class="page__student">
        <p><strong>Студент:</strong> Грішанов Данило Євгенович</p>
        <p><strong>Група:</strong> 7.F2.25-2</p>
        <p><strong>Середовище:</strong> Vue 3, Vite, Node.js</p>
      </div>
    </header>

    <section class="page__section">
      <h2 class="page__section-title">
        1. Вкладки Underline
      </h2>

      <p class="page__description">
        Панелі передаються через слоти компонентів Tab.
      </p>

      <Tabs v-model="activeUnderline" variant="underline">
        <Tab slug="overview" title="Огляд">
          <OverviewPanel />
        </Tab>

        <Tab slug="requirements" title="Вимоги">
          <RequirementsPanel />
        </Tab>

        <Tab slug="environment" title="Середовище">
          <EnvironmentPanel />
        </Tab>
      </Tabs>
    </section>

    <section class="page__section">
      <h2 class="page__section-title">
        2. Вкладки Pills
      </h2>

      <p class="page__description">
        Панелі створюються динамічно з масиву об'єктів.
      </p>

      <Tabs v-model="activePills" variant="pills">
        <Tab
          v-for="item in dynamicTabs"
          :key="item.slug"
          :slug="item.slug"
          :title="item.title"
          :panel="item.panel"
          :panel-props="item.panelProps"
        />
      </Tabs>
    </section>

    <section class="page__section">
      <h2 class="page__section-title">
        3. Вкладки Boxed
      </h2>

      <p class="page__description">
        Приклад із недоступною вкладкою та ModalDialog.
      </p>

      <Tabs v-model="activeBoxed" variant="boxed">
        <Tab slug="info" title="Інформація">
          <EnvironmentPanel heading="Демонстрація Boxed" />
        </Tab>

        <Tab slug="notes" title="Нотатки">
          <OverviewPanel heading="Нотатки Boxed" />
        </Tab>

        <Tab
          slug="disabled"
          title="Недоступна"
          disabled
        >
          <p>Цю вкладку не можна обрати.</p>
        </Tab>

        <Tab slug="tasks" title="Завдання">
          <RequirementsPanel />
        </Tab>
      </Tabs>
    </section>
  </main>
</template>

<style scoped lang="scss">
.page {
  @apply mx-auto w-full max-w-6xl;
  @apply px-4 py-8 md:px-8;

  &__header {
    @apply mb-10;
  }

  &__eyebrow {
    @apply mb-3 text-sm font-semibold uppercase;
    @apply tracking-wider text-muted;
  }

  &__title {
    @apply mb-4 font-display text-2xl;
    @apply leading-tight md:text-4xl;
  }

  &__subtitle {
    @apply mb-6 text-lg text-muted;
  }

  &__student {
    @apply rounded-xl border border-edge;
    @apply bg-paper p-5;
    @apply space-y-2;
  }

  &__section {
    @apply mb-8 min-w-0 rounded-2xl;
    @apply border border-edge bg-paper;
    @apply p-4 shadow-sm md:p-8;
  }

  &__section-title {
    @apply mb-3 text-xl font-semibold;
  }

  &__description {
    @apply mb-6 text-muted;
  }
}
</style>