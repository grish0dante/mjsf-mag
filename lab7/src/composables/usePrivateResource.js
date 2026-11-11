import { ref, shallowRef, toValue, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
export function usePrivateResource(source) {
  const auth = useAuthStore()
  const data = shallowRef(null)
  const error = shallowRef(null)
  const isLoading = ref(false)
  const version = ref(0)
  let sequence = 0
  watch(() => [toValue(source), version.value, auth.isAuthenticated], async ([path], _, onCleanup) => {
    const current = ++sequence
    const controller = new AbortController()
    onCleanup(() => controller.abort())
    data.value = null
    error.value = null
    isLoading.value = !!path && auth.isAuthenticated
    if (!path || !auth.isAuthenticated) return
    try {
      const result = await auth.request(path, { signal: controller.signal })
      if (current === sequence && !controller.signal.aborted) data.value = result
    } catch (cause) {
      if (current === sequence && !controller.signal.aborted) error.value = cause
    } finally {
      if (current === sequence) isLoading.value = false
    }
  }, { immediate: true })
  return { data, error, isLoading, refetch: () => version.value++ }
}
