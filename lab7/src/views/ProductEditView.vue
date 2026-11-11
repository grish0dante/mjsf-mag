<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useProductsStore } from '../stores/products.js'
import { useAuthStore } from '../stores/auth.js'
import { makeDraft, validateDraft } from '../api/productDraft.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const productsStore = useProductsStore()
const { saving, saveError } = storeToRefs(productsStore)
const id = computed(() => String(route.params.id ?? ''))
const validId = computed(() => /^[1-9]\d*$/.test(id.value))
const path = computed(() => validId.value ? `/auth/products/${id.value}` : null)
const { data, error, isLoading, refetch } = usePrivateResource(path)
const current = computed(() => productsStore.merge(data.value))
const breadcrumbs = useBreadcrumbs(computed(() => current.value?.title))
const draft = reactive(makeDraft(null))
const baseline = ref(makeDraft(null))
const errors = ref({})
const fieldRefs = {}
const dirty = computed(() => JSON.stringify(draft) !== JSON.stringify(baseline.value))
watch(current, value => {
  if (!value) return
  const next = makeDraft(value)
  Object.assign(draft, next)
  baseline.value = next
  errors.value = {}
}, { immediate: true })
function cancel() {
  Object.assign(draft, baseline.value)
  errors.value = {}
}
async function save() {
  if (saving.value || !current.value) return
  const checked = validateDraft(draft)
  errors.value = checked.errors
  if (!checked.valid) {
    await nextTick()
    fieldRefs[Object.keys(checked.errors)[0]]?.focus()
    return
  }
  if (await productsStore.save(id.value, { ...draft })) {
    const next = makeDraft(productsStore.merge(data.value))
    Object.assign(draft, next)
    baseline.value = next
  }
}
function confirmDiscard() {
  if (!auth.isAuthenticated || !dirty.value) return true
  return window.confirm('Є незбережені зміни. Вийти без збереження?')
}
onBeforeRouteLeave(confirmDiscard)
onBeforeRouteUpdate(confirmDiscard)
function beforeUnload(event) {
  if (!auth.isAuthenticated || !dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))
</script>
<template>
  <section class="manage__section">
    <Breadcrumbs :items="breadcrumbs" />
    <h2>Редагування товару №{{ id }}</h2>
    <p v-if="!validId || error?.status === 404" role="alert">Товар не знайдено.</p>
    <p v-else-if="isLoading" role="status">Завантаження товару…</p>
    <div v-else-if="error" role="alert"><p>{{ error.message }}</p><button @click="refetch">Повторити</button></div>
    <form v-else-if="current" class="manage__form" novalidate @submit.prevent="save">
      <label for="edit-title">Назва товару</label>
      <input id="edit-title" :ref="el => fieldRefs.title = el" v-model="draft.title" maxlength="121" :disabled="saving" :aria-invalid="!!errors.title" aria-describedby="err-title" />
      <p v-if="errors.title" id="err-title" class="manage__error">{{ errors.title }}</p>
      <label for="edit-price">Ціна ($)</label>
      <input id="edit-price" :ref="el => fieldRefs.price = el" v-model="draft.price" type="number" step="any" :disabled="saving" :aria-invalid="!!errors.price" aria-describedby="err-price" />
      <p v-if="errors.price" id="err-price" class="manage__error">{{ errors.price }}</p>
      <label for="edit-stock">Залишок</label>
      <input id="edit-stock" :ref="el => fieldRefs.stock = el" v-model="draft.stock" type="number" step="1" :disabled="saving" :aria-invalid="!!errors.stock" aria-describedby="err-stock" />
      <p v-if="errors.stock" id="err-stock" class="manage__error">{{ errors.stock }}</p>
      <label for="edit-description">Опис</label>
      <textarea id="edit-description" :ref="el => fieldRefs.description = el" v-model="draft.description" rows="6" maxlength="2001" :disabled="saving" :aria-invalid="!!errors.description" aria-describedby="err-description" />
      <p v-if="errors.description" id="err-description" class="manage__error">{{ errors.description }}</p>
      <p v-if="saveError" class="manage__error" role="alert">{{ saveError }}</p>
      <div class="manage__actions">
        <button type="submit" :disabled="saving || !dirty">{{ saving ? 'Збереження…' : 'Зберегти зміни' }}</button>
        <button type="button" :disabled="saving || !dirty" @click="cancel">Скасувати зміни</button>
        <RouterLink :to="{ name: 'manage-products' }">До списку</RouterLink>
      </div>
    </form>
  </section>
</template>
