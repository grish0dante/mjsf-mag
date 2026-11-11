const BASE = 'https://dummyjson.com'
export async function http(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method, headers, signal, credentials: 'omit',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    throw error
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(payload?.message || `HTTP ${response.status}`)
    error.status = response.status
    throw error
  }
  return payload
}
