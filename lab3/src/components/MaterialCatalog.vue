
<script setup>
import { ref, reactive, computed } from 'vue'
import { materials } from '../data/materials.js'

import MaterialCard from './MaterialCard.vue'
import MaterialFilterForm from './MaterialFilterForm.vue'
import ModalDialog from './ModalDialog.vue'

// Робоча копія матеріалів
const items = ref(
  materials.map(material => ({ ...material }))
)

// Фільтри
const activeFilters = reactive({
  query: '',
  topic: 'all'
})

// Вибір за id
const selectedId = ref(items.value[0]?.id ?? null)

// Стан модального вікна
const isOpen = ref(false)
const dialogMode = ref('edit')
const editingId = ref(null)
const draft = ref({ title: '', minutes: '' })
const formError = ref('')

// Посилання на DOM
const nameInput = ref(null)
const cancelButton = ref(null)
const catalogHeading = ref(null)

// Назва вибраного матеріалу
const selectedTitle = computed(() => {
  return items.value.find(
    item => item.id === selectedId.value
  )?.title ?? 'Немає вибраного матеріалу'
})

// Матеріал поточного діалогу
const currentMaterial = computed(() => {
  return items.value.find(
    item => item.id === editingId.value
  ) ?? null
})

// Заголовок модального вікна
const dialogTitle = computed(() => {
  return dialogMode.value === 'edit'
    ? 'Редагування матеріалу'
    : 'Підтвердження видалення'
})

// Початковий фокус
const initialFocus = computed(() => {
  return dialogMode.value === 'edit'
    ? nameInput.value
    : cancelButton.value
})

// Фільтрація
const filteredMaterials = computed(() => {
  const query = activeFilters.query
    .trim()
    .toLowerCase()

  return items.value.filter(material => {
    const matchesQuery = material.title
      .toLowerCase()
      .includes(query)

    const matchesTopic =
      activeFilters.topic === 'all' ||
      material.topic === activeFilters.topic

    return matchesQuery && matchesTopic
  })
})

// Сумарна тривалість
const totalMinutes = computed(() => {
  return filteredMaterials.value.reduce(
    (sum, item) => sum + item.minutes,
    0
  )
})

function applyFilters(payload) {
  activeFilters.query = payload.query
  activeFilters.topic = payload.topic
}

function clearFilters() {
  activeFilters.query = ''
  activeFilters.topic = 'all'
}

function openEdit(material) {
  dialogMode.value = 'edit'
  editingId.value = material.id

  draft.value = {
    title: material.title,
    minutes: String(material.minutes)
  }

  formError.value = ''
  isOpen.value = true
}

function openDelete(material) {
  dialogMode.value = 'delete'
  editingId.value = material.id

  formError.value = ''
  isOpen.value = true
}

function closeDialog() {
  isOpen.value = false
}

function saveMaterial() {
  const title = draft.value.title.trim()
  const minutes = Number(draft.value.minutes)

  if (!title) {
    formError.value = 'Введіть назву матеріалу.'
    return
  }

  if (
    String(draft.value.minutes).trim() === '' ||
    !Number.isInteger(minutes) ||
    minutes <= 0
  ) {
    formError.value =
      'Тривалість має бути додатним цілим числом.'
    return
  }

  const material = items.value.find(
    item => item.id === editingId.value
  )

  if (!material) {
    formError.value = 'Матеріал не знайдено.'
    return
  }

  // Створюємо новий об'єкт замість зміни
  // імпортованих початкових даних
  items.value = items.value.map(item =>
    item.id === editingId.value
      ? { ...item, title, minutes }
      : item
  )

  closeDialog()
}

function deleteMaterial() {
  const id = editingId.value

  items.value = items.value.filter(
    item => item.id !== id
  )

  if (selectedId.value === id) {
    selectedId.value = items.value[0]?.id ?? null
  }

  closeDialog()
}
</script>

<template>
  <section
    class="material-catalog"
    aria-labelledby="catalog-title"
  >
    <div class="material-catalog__heading">
      <div>
        <h2
          ref="catalogHeading"
          id="catalog-title"
          tabindex="-1"
          class="material-catalog__title"
        >
          Каталог матеріалів
        </h2>
      </div>

      <p class="material-catalog__summary">
        <strong class="material-catalog__count">
          Знайдено: {{ filteredMaterials.length }}
        </strong>

        <span aria-hidden="true">·</span>

        Загальна тривалість:
        {{ totalMinutes }} хв
      </p>
    </div>

    <MaterialFilterForm
      @apply="applyFilters"
      @clear="clearFilters"
    />

    <p class="selection-status" aria-live="polite">
      <span class="selection-status__label">
        Обраний матеріал
      </span>

      <strong class="selection-status__value">
        {{ selectedTitle }}
      </strong>
    </p>

    <div
      v-if="filteredMaterials.length"
      class="material-list"
    >
      <MaterialCard
        v-for="material in filteredMaterials"
        :key="material.id"
        :number="material.id"
        :title="material.title"
        :topic="material.topic"
        :description="material.description"
        :minutes="material.minutes"
        :selected="selectedId === material.id"
        @select="selectedId = material.id"
        @edit="openEdit(material)"
        @delete="openDelete(material)"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>

    <!-- Один універсальний діалог -->
    <ModalDialog
      v-model="isOpen"
      :title="dialogTitle"
      :initial-focus="initialFocus"
      :fallback-focus="catalogHeading"
    >
      <!-- Редагування -->
      <template v-if="dialogMode === 'edit'">
        <form
          id="material-edit-form"
          novalidate
          class="flex flex-col gap-4"
          @submit.prevent="saveMaterial"
        >
          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold">
              Назва матеріалу
            </span>

            <input
              ref="nameInput"
              v-model="draft.title"
              type="text"
              required
              class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            />
          </label>

          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold">
              Тривалість (хв)
            </span>

            <input
              v-model="draft.minutes"
              type="number"
              min="1"
              step="1"
              required
              class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            />
          </label>

          <p
            v-if="formError"
            role="alert"
            class="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {{ formError }}
          </p>
        </form>
      </template>

      <!-- Підтвердження видалення -->
      <template v-else>
        <p class="text-base leading-relaxed">
          Ви дійсно бажаєте видалити матеріал
          <strong>{{ currentMaterial?.title }}</strong>?
        </p>

        <p class="mt-3 text-sm text-red-700">
          Після підтвердження матеріал буде
          видалено з поточного каталогу.
        </p>
      </template>

      <!-- Кнопки діалогу -->
      <template #footer>
        <button
          ref="cancelButton"
          type="button"
          class="min-h-11 w-full rounded-lg border border-slate-300 px-5 py-2 sm:w-auto"
          @click="closeDialog"
        >
          Скасувати
        </button>

        <button
          v-if="dialogMode === 'edit'"
          type="submit"
          form="material-edit-form"
          class="min-h-11 min-w-11 rounded-lg bg-slate-800 px-5 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          Зберегти
        </button>

        <button
          v-else
          type="button"
          class="min-h-11 min-w-11 rounded-lg bg-red-700 px-5 py-2 font-semibold text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
          @click="deleteMaterial"
        >
          Видалити
        </button>
      </template>
    </ModalDialog>
  </section>
</template>
