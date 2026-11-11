import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.js'
import { validateDraft } from '../api/productDraft.js'

export const useProductsStore = defineStore('products', () => {
  const confirmed = ref({})
  const saving = ref(false)
  const saveError = ref('')
  const auth = useAuthStore()
  let revision = 0
  let controller = null
  function merge(product) {
    if (!product) return product
    return { ...product, ...(confirmed.value[String(product.id)] || {}) }
  }
  const confirmedCount = computed(() => Object.keys(confirmed.value).length)
  function reset() {
    revision++
    controller?.abort()
    controller = null
    confirmed.value = {}
    saving.value = false
    saveError.value = ''
  }
  auth.onSessionEnd(reset)
  async function save(id, draft) {
    if (saving.value || !auth.isAuthenticated) return false
    const checked = validateDraft(draft)
    if (!checked.valid) return false
    const current = ++revision
    const token = auth.accessToken
    controller = new AbortController()
    saving.value = true
    saveError.value = ''
    try {
      await auth.request(`/auth/products/${id}`, {
        method: 'PATCH', body: checked.values, signal: controller.signal,
      })
      if (current !== revision || !auth.isAuthenticated || auth.accessToken !== token || controller.signal.aborted) return false
      confirmed.value = { ...confirmed.value, [String(id)]: { ...checked.values } }
      return true
    } catch (cause) {
      if (current === revision && cause.name !== 'AbortError') saveError.value = cause.message || 'Не вдалося зберегти товар'
      return false
    } finally {
      if (current === revision) { saving.value = false; controller = null }
    }
  }
  return { confirmed, confirmedCount, saving, saveError, merge, save, reset }
})
