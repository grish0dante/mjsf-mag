
import { ref, readonly, toValue, watch } from 'vue'

export function useDebouncedValue(source, delay = 400) {
  const debouncedValue = ref(toValue(source))

  watch(
    () => toValue(source),
    (newValue, oldValue, onCleanup) => {
      const timer = setTimeout(() => {
        debouncedValue.value = newValue
      }, delay)

      onCleanup(() => {
        clearTimeout(timer)
      })
    },
  )

  return readonly(debouncedValue)
}
