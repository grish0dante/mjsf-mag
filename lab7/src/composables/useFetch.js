
import {
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue'

export function useFetch(url) {
  const data = shallowRef(null)
  const error = shallowRef(null)
  const isLoading = ref(false)
  const requestVersion = ref(0)

  let activeController = null
  let requestId = 0

  function abort() {
    requestId++

    if (activeController) {
      activeController.abort()
      activeController = null
    }

    isLoading.value = false
  }

  function refetch() {
    requestVersion.value++
  }

  watch(
    () => [toValue(url), requestVersion.value],
    async ([currentUrl], oldValue, onCleanup) => {
      const currentId = ++requestId

      const controller = new AbortController()
      activeController = controller

      data.value = null
      error.value = null
      isLoading.value = Boolean(currentUrl)

      onCleanup(() => {
        controller.abort()
      })

      if (!currentUrl) {
        activeController = null
        return
      }

      try {
        const response = await fetch(currentUrl, {
          signal: controller.signal,
        })

        if (!response.ok) {
          const httpError = new Error(
            `Помилка HTTP ${response.status}`,
          )

          httpError.status = response.status
          throw httpError
        }

        const result = await response.json()

        if (
          currentId === requestId &&
          !controller.signal.aborted
        ) {
          data.value = result
        }
      } catch (cause) {
        if (
          currentId === requestId &&
          !controller.signal.aborted
        ) {
          error.value = cause
        }
      } finally {
        if (currentId === requestId) {
          isLoading.value = false
          activeController = null
        }
      }
    },
    { immediate: true },
  )

  return {
    data,
    error,
    isLoading,
    abort,
    refetch,
  }
}
