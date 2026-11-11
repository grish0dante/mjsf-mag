import { useAuthStore } from '../stores/auth.js'
export function installGuards(router, pinia) {
  router.beforeEach(async to => {
    const auth = useAuthStore(pinia)
    if (auth.status === 'idle') await auth.restore()
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  })
}
export function safeRedirect(router, value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return { name: 'manage-products' }
  try {
    const route = router.resolve(value)
    if (['manage-products', 'manage-edit'].includes(route.name)) return route.fullPath
  } catch { /* invalid path */ }
  return { name: 'manage-products' }
}
