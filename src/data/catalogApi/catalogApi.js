const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request(path) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`)
  } catch {
    const err = new Error('No se pudo conectar con el servidor.')
    err.status = 0
    throw err
  }

  if (!res.ok) {
    let msg = `Error ${res.status}`
    try {
      const data = await res.json()
      msg = data.details?.join('. ') || data.error || msg
    } catch {
      /* keep default */
    }
    const err = new Error(msg)
    err.status = res.status
    throw err
  }

  return res.json()
}

function buildQuery(params) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === '' || v === 'todos') continue
    sp.set(k, v)
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export const catalogApi = {
  fetchProducts: (params = {}) =>
    request(`/products${buildQuery({ active: 'true', ...params })}`),

  fetchFacets: (params = {}) =>
    request(`/products/facets${buildQuery({ active: 'true', ...params })}`),

  fetchBrands: (limit = 200) =>
    request(`/brands?limit=${limit}`),

  fetchProduct: id => request(`/products/${id}`),
}