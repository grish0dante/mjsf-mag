
import { ref, shallowRef, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = shallowRef(null)
  const error = shallowRef(null)
  const isLoading = ref(false)

  const requestVersion = ref(0)

  let activeController = null

  function abort() {
    if (activeController) {
      activeController.abort()
      activeController = null
    }

    isLoading.value = false
  }

  function refetch() {
    requestVersion.value++
  }

  watchEffect(async (onCleanup) => {
    const currentUrl = toValue(url)

    // Реактивна залежність для повторного запиту.
    requestVersion.value

    const controller = new AbortController()

    activeController = controller
    data.value = null
    error.value = null
    isLoading.value = true

    onCleanup(() => {
      controller.abort()
    })

    try {
      const response = await fetch(currentUrl, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (
        !controller.signal.aborted &&
        activeController === controller
      ) {
        data.value = result
      }
    } catch (cause) {
      if (
        !controller.signal.aborted &&
        activeController === controller
      ) {
        error.value = cause
      }
    } finally {
      if (activeController === controller) {
        isLoading.value = false
        activeController = null
      }
    }
  })

  return {
    data,
    error,
    isLoading,
    abort,
    refetch,
  }
}
