export const EDITABLE_FIELDS = ['title', 'price', 'stock', 'description']
export function makeDraft(product) {
  return {
    title: String(product?.title ?? ''),
    price: String(product?.price ?? ''),
    stock: String(product?.stock ?? ''),
    description: String(product?.description ?? ''),
  }
}
export function validateDraft(draft) {
  const values = {
    title: String(draft.title ?? '').trim(),
    description: String(draft.description ?? '').trim(),
    price: Number(draft.price),
    stock: Number(draft.stock),
  }
  const errors = {}
  if (!values.title || values.title.length > 120) errors.title = 'Назва: від 1 до 120 символів.'
  if (!values.description || values.description.length > 2000) errors.description = 'Опис: від 1 до 2000 символів.'
  if (String(draft.price ?? '').trim() === '' || !Number.isFinite(values.price) || values.price <= 0) errors.price = 'Ціна має бути числом більшим за нуль.'
  if (String(draft.stock ?? '').trim() === '' || !Number.isInteger(values.stock) || values.stock < 0) errors.stock = 'Залишок має бути цілим невід’ємним числом.'
  return { values, errors, valid: Object.keys(errors).length === 0 }
}
