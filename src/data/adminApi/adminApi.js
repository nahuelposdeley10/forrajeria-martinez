const TOKEN_KEY = 'fm_admin_token'
let token = localStorage.getItem(TOKEN_KEY) || ''

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function setToken(next) {
  token = next || ''
  if (next) localStorage.setItem(TOKEN_KEY, next)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return token
}

async function request(path, options = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  let res
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers })
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
    if (res.status === 401 && !path.includes('/auth/login')) {
      setToken(null)
    }
    const err = new Error(msg)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/auth/me'),

  fetchProducts: async (params = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set('search', params.search)
    if (params.brand) sp.set('brand', params.brand)
    if (params.category) sp.set('category', params.category)
    if (params.page) sp.set('page', params.page)
    if (params.limit) sp.set('limit', params.limit)
    const qs = sp.toString()
    return request(`/products${qs ? `?${qs}` : ''}`)
  },

  fetchFacets: (opts = {}) => {
    const sp = new URLSearchParams()
    if (opts.category) sp.set('category', opts.category)
    sp.set('active', opts.active === 'all' ? 'all' : 'true')
    return request(`/products/facets?${sp.toString()}`)
  },

  createProduct: data =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteProduct: id => request(`/products/${id}`, { method: 'DELETE' }),

  uploadImage: file => {
    const fd = new FormData()
    fd.append('image', file)
    return request('/upload', { method: 'POST', body: fd })
  },

  fetchBrands: (params = {}) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set('search', params.search)
    if (params.page) sp.set('page', params.page)
    if (params.limit) sp.set('limit', params.limit)
    const qs = sp.toString()
    return request(`/brands${qs ? `?${qs}` : ''}`)
  },

  createBrand: name =>
    request('/brands', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  renameBrand: (oldName, newName) =>
    request(`/brands/${encodeURIComponent(oldName)}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    }),

  deleteBrand: (name, opts = {}) =>
    request(`/brands/${encodeURIComponent(name)}?products=${opts.products || 'unbrand'}`, {
      method: 'DELETE',
    }),

  fetchPromotions: () => request('/promotions?active=all'),

  createPromotion: data =>
    request('/promotions', { method: 'POST', body: JSON.stringify(data) }),

  updatePromotion: (id, data) =>
    request(`/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deletePromotion: id => request(`/promotions/${id}`, { method: 'DELETE' }),
}