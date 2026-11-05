
<script setup>
import { ref, useId, onDeactivated } from 'vue'
import ModalDialog from '../ModalDialog.vue'

defineProps({
  heading: {
    type: String,
    default: 'Середовище розробки'
  }
})

// Стан основної панелі
const comment = ref('')
const visits = ref(0)

// Стан модального вікна
const isModalOpen = ref(false)
const modalNote = ref('')
const modalChecked = ref(false)
const modalCounter = ref(0)

// Посилання на кнопки для керування фокусом
const openButton = ref(null)
const closeButton = ref(null)

// Унікальні ID для полів
const commentId = useId()
const modalNoteId = useId()

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

// Якщо панель деактивується через KeepAlive,
// закриваємо модальне вікно
onDeactivated(() => {
  closeModal()
})
</script>

<template>
  <div class="environment">
    <h3 class="environment__title">
      {{ heading }}
    </h3>

    <div class="environment__info">
      <p><strong>Фреймворк:</strong> Vue 3</p>
      <p><strong>Мова:</strong> JavaScript</p>
      <p><strong>Збірка:</strong> Vite</p>
      <p><strong>Стилі:</strong> Tailwind CSS + SCSS</p>
    </div>

    <!-- Коментар у головній панелі -->
    <div class="environment__field">
      <label
        class="environment__label"
        :for="commentId"
      >
        Коментар
      </label>

      <input
        :id="commentId"
        v-model="comment"
        class="environment__input"
        placeholder="Введіть коментар"
      />
    </div>

    <p class="environment__result">
      Коментар: {{ comment || 'Не введено' }}
    </p>

    <!-- Кнопки головної панелі -->
    <div class="environment__actions">
      <button
        type="button"
        class="environment__button"
        @click="visits++"
      >
        Лічильник панелі: {{ visits }}
      </button>

      <button
        ref="openButton"
        type="button"
        class="environment__button"
        @click="openModal"
      >
        Відкрити модальне вікно
      </button>
    </div>

    <!-- Модальне вікно з лабораторної №3 -->
    <ModalDialog
      v-model="isModalOpen"
      title="Перевірка збереження стану"
      :initial-focus="closeButton"
      :fallback-focus="openButton"
    >
      <div class="environment__modal-content">
        <p class="environment__modal-description">
          Введіть текст, позначте прапорець і змініть
          значення лічильника. Потім закрийте
          модальне вікно та відкрийте його повторно.
        </p>

        <!-- Текстове поле модального вікна -->
        <div class="environment__field">
          <label
            class="environment__label"
            :for="modalNoteId"
          >
            Нотатка
          </label>

          <textarea
            :id="modalNoteId"
            v-model="modalNote"
            class="environment__input environment__textarea"
            rows="3"
            placeholder="Введіть текст..."
          />
        </div>

        <!-- Прапорець -->
        <label class="environment__checkbox">
          <input
            v-model="modalChecked"
            type="checkbox"
          />

          <span>Завдання виконано</span>
        </label>

        <p class="environment__result">
          Стан прапорця:
          {{ modalChecked ? 'Позначено' : 'Не позначено' }}
        </p>

        <!-- Лічильник модального вікна -->
        <div class="environment__counter">
          <p>
            Значення лічильника:
            <strong>{{ modalCounter }}</strong>
          </p>

          <div class="environment__actions">
            <button
              type="button"
              class="environment__button"
              @click="modalCounter++"
            >
              +1
            </button>

            <button
              type="button"
              class="environment__button environment__button--secondary"
              @click="modalCounter = 0"
            >
              Скинути
            </button>
          </div>
        </div>

        <!-- Інформація про збереження стану -->
        <div class="environment__hint">
          <p>
            <strong>KeepAlive:</strong>
            стан цієї панелі зберігається
            після перемикання вкладок.
          </p>

          <p>
            <strong>Teleport:</strong>
            модальне вікно відображається
            безпосередньо всередині body.
          </p>
        </div>
      </div>

      <!-- Нижня частина модального вікна -->
      <template #footer="{ close }">
        <button
          type="button"
          class="environment__button environment__button--secondary"
          @click="() => {
            modalNote = ''
            modalChecked = false
            modalCounter = 0
          }"
        >
          Очистити дані
        </button>

        <button
          ref="closeButton"
          type="button"
          class="environment__button"
          @click="close"
        >
          Закрити
        </button>
      </template>
    </ModalDialog>
  </div>
</template>

<style scoped lang="scss">
.environment {
  @apply space-y-5;

  // Заголовок
  &__title {
    @apply text-xl font-semibold text-ink;
  }

  // Інформація про середовище
  &__info {
    @apply space-y-2 text-ink;
  }

  // Поля введення
  &__field {
    @apply space-y-2;
  }

  &__label {
    @apply block font-semibold text-ink;
  }

  &__input {
    @apply block w-full rounded-lg;
    @apply border border-edge bg-paper p-3;
    @apply text-ink outline-none;
    @apply transition-colors;
    @apply focus:border-accent;
  }

  &__textarea {
    @apply min-h-24 resize-y;
  }

  // Текст результату
  &__result {
    @apply break-words text-sm text-muted;
  }

  // Контейнер кнопок
  &__actions {
    @apply flex flex-wrap gap-3;
  }

  // Кнопки
  &__button {
    @apply rounded-lg bg-deep px-5 py-3;
    @apply font-semibold text-paper;
    @apply transition-opacity hover:opacity-90;

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-accent;
    }

    &--secondary {
      @apply border border-edge bg-surface text-ink;
    }
  }

  // Вміст модального вікна
  &__modal-content {
    @apply space-y-5 text-ink;
  }

  &__modal-description {
    @apply leading-relaxed text-muted;
  }

  // Прапорець
  &__checkbox {
    @apply flex cursor-pointer items-center gap-3;
    @apply rounded-lg bg-surface p-3;

    input {
      @apply h-4 w-4 accent-teal-500;
    }
  }

  // Лічильник
  &__counter {
    @apply space-y-3 rounded-xl;
    @apply border border-edge p-4;
  }

  // Підказка
  &__hint {
    @apply space-y-2 rounded-lg;
    @apply border border-edge bg-surface p-4;
    @apply text-sm leading-relaxed;
  }
}
</style>
