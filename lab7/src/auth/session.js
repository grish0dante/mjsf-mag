const KEY = 'forma.lab7.accessToken'
export function readToken() {
  try { return sessionStorage.getItem(KEY) } catch { return null }
}
export function writeToken(token) {
  try { sessionStorage.setItem(KEY, token) } catch { /* blocked storage */ }
}
export function removeToken() {
  try { sessionStorage.removeItem(KEY) } catch { /* blocked storage */ }
}
