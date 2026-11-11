
import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '../stores/products.js'

export function useBreadcrumbs(productTitle = null) {
  const route = useRoute()
  const productsStore = useProductsStore()

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

      if (breadcrumb.dynamic === 'manage-product') {
        const override = productsStore.confirmed[String(route.params.id)]
        label = toValue(productTitle) || override?.title || `Товар №${route.params.id}`
      }
      const to = {
        name: breadcrumb.name,
      }

      if (
        breadcrumb.name === 'product-overview' ||
        breadcrumb.name === 'product-reviews' ||
        breadcrumb.name === 'manage-edit'
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
