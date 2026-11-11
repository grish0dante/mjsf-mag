
import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'

export function useBreadcrumbs(productTitle = null) {
  const route = useRoute()

  return computed(() => {
    const items = []

    for (const record of route.matched) {
      const breadcrumb = record.meta.breadcrumb

      if (!breadcrumb) continue

      let label = breadcrumb.label

      if (breadcrumb.dynamic === 'product') {
        const title = toValue(productTitle)
        const id = route.params.id

        label = title || `Товар №${id}`
      }

      const to = {
        name: breadcrumb.name,
      }

      if (
        breadcrumb.name === 'product-overview' ||
        breadcrumb.name === 'product-reviews'
      ) {
        to.params = {
          id: route.params.id,
        }
      }

      if (typeof route.query.q === 'string') {
        to.query = {
          q: route.query.q,
        }
      }

      items.push({
        label,
        to,
      })
    }

    return items
  })
}
