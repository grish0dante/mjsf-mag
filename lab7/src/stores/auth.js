import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { http } from '../api/http.js'
import { readToken, writeToken, removeToken } from '../auth/session.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const status = ref('idle')
  const error = ref('')
  const isAuthenticated = computed(() => status.value === 'authenticated' && !!user.value && !!accessToken.value)
  const isBusy = computed(() => ['restoring', 'signing-in'].includes(status.value))
  let generation = 0
  let restorePromise = null
  const controllers = new Set()
  const resetListeners = new Set()

  function onSessionEnd(callback) {
    resetListeners.add(callback)
    return () => resetListeners.delete(callback)
  }
  function endSession() {
    generation++
    for (const controller of controllers) controller.abort()
    controllers.clear()
    restorePromise = null
    user.value = null
    accessToken.value = null
    status.value = 'guest'
    error.value = ''
    removeToken()
    for (const listener of resetListeners) listener()
  }
  function logout() { endSession() }
  function trackController() {
    const controller = new AbortController()
    controllers.add(controller)
    return controller
  }
  async function restore() {
    if (restorePromise) return restorePromise
    if (status.value === 'authenticated' || status.value === 'guest') return
    const token = accessToken.value || readToken()
    if (!token) {
      status.value = 'guest'
      return
    }
    const current = ++generation
    const controller = trackController()
    status.value = 'restoring'
    error.value = ''
    const pending = (async () => {
      try {
        const profile = await http('/auth/me', { token, signal: controller.signal })
        if (generation !== current || controller.signal.aborted) return
        accessToken.value = token
        user.value = profile
        status.value = 'authenticated'
      } catch (cause) {
        if (generation !== current || controller.signal.aborted) return
        if (cause.status === 401) endSession()
        else {
          user.value = null
          accessToken.value = null
          status.value = 'unavailable'
          error.value = 'Не вдалося перевірити сеанс. Спробуйте ще раз.'
        }
      } finally {
        controllers.delete(controller)
      }
    })()
    restorePromise = pending
    try { await pending } finally { if (restorePromise === pending) restorePromise = null }
  }
  async function login(username, password) {
    if (isBusy.value || isAuthenticated.value) return false
    const current = ++generation
    const controller = trackController()
    status.value = 'signing-in'
    error.value = ''
    try {
      const result = await http('/auth/login', {
        method: 'POST', body: { username, password, expiresInMins: 30 }, signal: controller.signal,
      })
      if (generation !== current || controller.signal.aborted) return false
      if (!result.accessToken) throw new Error('Сервер не повернув accessToken')
      accessToken.value = result.accessToken
      user.value = result
      writeToken(result.accessToken)
      status.value = 'authenticated'
      return true
    } catch (cause) {
      if (generation !== current || controller.signal.aborted) return false
      user.value = null
      accessToken.value = null
      status.value = 'guest'
      error.value = cause.message || 'Помилка входу'
      return false
    } finally {
      controllers.delete(controller)
    }
  }
  async function request(path, options = {}) {
    if (!isAuthenticated.value) throw new Error('Необхідний підтверджений вхід')
    const token = accessToken.value
    const current = generation
    const controller = trackController()
    const abort = () => controller.abort()
    if (options.signal?.aborted) abort()
    options.signal?.addEventListener('abort', abort, { once: true })
    try {
      const result = await http(path, { ...options, token, signal: controller.signal })
      if (current !== generation || token !== accessToken.value || controller.signal.aborted) {
        throw new DOMException('Сеанс змінився', 'AbortError')
      }
      return result
    } catch (cause) {
      if (cause.status === 401 && current === generation && token === accessToken.value) endSession()
      throw cause
    } finally {
      options.signal?.removeEventListener('abort', abort)
      controllers.delete(controller)
    }
  }
  return { user, accessToken, status, error, isAuthenticated, isBusy, login, restore, logout, request, onSessionEnd }
})
