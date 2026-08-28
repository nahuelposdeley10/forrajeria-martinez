import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, formatPrice } from '../../data/products/products'
import { api, setToken, getToken } from '../../data/adminApi/adminApi'
import './Admin.css'

const PAGE_SIZE = 12
const TOAST_MS = 3200

const EMPTY_FORM = {
  id: null,
  name: '',
  brand: '',
  category: 'perros',
  description: '',
  detailsText: '',
  price: '',
  stock: 0,
  featured: false,
  active: true,
  image: '',
}

const IMAGE_MAX = 2 * 1024 * 1024

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login(email.trim(), password)
      setToken(data.token)
      onLogin()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="admin-login-icon">🔐</span>
        <h2>Acceso al backoffice</h2>
        <p>Ingresá con tu usuario del backoffice.</p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          autoFocus
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          required
        />
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <Link to="/" className="admin-back-link">← Volver a la tienda</Link>
      </form>
    </div>
  )
}

function ProductForm({ initial, brandList, onSubmit, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial, detailsText: (initial?.details || []).join('\n') })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleFile = async file => {
    if (!file) return
    if (file.size > IMAGE_MAX) {
      alert('La imagen es muy pesada (máximo 2 MB).')
      return
    }
    setUploading(true)
    setError('')
    try {
      const res = await api.uploadImage(file)
      set('image', res.url)
    } catch (err) {
      setError(`No se pudo subir la imagen: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError('')
    const product = {
      name: form.name.trim(),
      brand: form.brand.trim() || '',
      category: form.category,
      description: form.description.trim(),
      details: form.detailsText.split('\n').map(s => s.trim()).filter(Boolean),
      price: Number(form.price) || 0,
      stock: Math.max(0, Number(form.stock) || 0),
      featured: form.featured,
      active: form.active,
      image: form.image || '',
    }
    try {
      await onSubmit({ id: form.id, ...product })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal" onSubmit={submit}>
        <div className="admin-modal-head">
          <h3>{form.id ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button type="button" className="admin-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-form-grid">
          <label>
            Nombre
            <input value={form.name} onChange={e => set('name', e.target.value)} required />
          </label>
          <label>
            Marca
            <select value={form.brand} onChange={e => set('brand', e.target.value)}>
              <option value="">Sin marca</option>
              {brandList.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </label>
          <label>
            Categoría
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {categories.filter(c => c !== 'todos').map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </label>
          <label>
            Precio ($)
            <input type="number" min="0" step="any" value={form.price} onChange={e => set('price', e.target.value)} required />
          </label>
          <label>
            Stock (0 = sin stock)
            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
          </label>
          <label>
            URL de imagen
            <input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://res.cloudinary.com/..." />
          </label>
        </div>

        <div className="admin-form-checkboxes">
          <label><input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} /> Visible en la tienda</label>
          <label><input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /> Destacado</label>
        </div>

        <label className="admin-full">
          Imagen
          <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} disabled={uploading} />
          {uploading && <span className="admin-hint">Subiendo a Cloudinary...</span>}
          {(form.image || uploading) && (
            <img src={form.image || ''} alt="Vista previa" className="admin-image-preview" />
          )}
        </label>

        <label className="admin-full">
          Descripción
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows="2" placeholder="Breve descripción que se muestra en la tarjeta" />
        </label>

        <label className="admin-full">
          Detalles (uno por línea)
          <textarea value={form.detailsText} onChange={e => set('detailsText', e.target.value)} rows="4" placeholder={'Marca: X\nPresentación: x20\nOtra información'} />
        </label>

        <div className="admin-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
            {submitting ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  )
}

function BrandsPanel({ brands, search, page, total, pages, loading, onCreate, onRename, onDelete, onSearch, onPage }) {
  const [newName, setNewName] = useState('')
  const [renaming, setRenaming] = useState(null)
  const [renamingValue, setRenamingValue] = useState('')
  const [busy, setBusy] = useState(false)

  const submitNew = async e => {
    e.preventDefault()
    const name = newName.trim()
    if (!name || busy) return
    setBusy(true)
    try {
      await onCreate(name)
      setNewName('')
    } catch {
      /* el error ya se muestra via toast */
    } finally {
      setBusy(false)
    }
  }

  const submitRename = async e => {
    e.preventDefault()
    const next = renamingValue.trim()
    if (!next || next === renaming.name || busy) return
    setBusy(true)
    try {
      await onRename(renaming.name, next)
      setRenaming(null)
    } catch {
      /* error via toast */
    } finally {
      setBusy(false)
    }
  }

  const pageSafe = Math.min(page, pages)
  const pageNumbers = pages > 1
    ? Array.from({ length: pages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === pages || Math.abs(p - pageSafe) <= 2)
        .reduce((acc, p, i, arr) => {
          if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
          acc.push(p)
          return acc
        }, [])
    : []

  return (
    <div className="admin-tab">
      <div className="admin-tab-head">
        <h3>Marcas</h3>
        <form className="admin-brands-create" onSubmit={submitNew}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nueva marca..."
          />
          <button type="submit" className="btn btn-primary" disabled={busy || !newName.trim()}>
            Crear
          </button>
        </form>
      </div>
      <p className="admin-hint">Las marcas se listan según el backoffice.</p>
      <div className="admin-brand-toolbar">
        <input
          className="admin-search"
          placeholder="Buscar marca..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        <span className="results-count">{loading ? 'Cargando...' : `${total} marca${total !== 1 ? 's' : ''}`}</span>
      </div>
      <div className="admin-table">
        {!loading && brands.map(b => (
          <div className="admin-table-row admin-brand-row" key={b.name}>
            <div className="admin-brand-info">
              <span className="admin-brand-name">{b.name}</span>
              <span className="admin-hint">{b.count} producto{b.count !== 1 ? 's' : ''}</span>
            </div>
            <div className="admin-actions admin-brand-actions">
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => { setRenaming(b); setRenamingValue(b.name) }}>Renombrar</button>
              <button type="button" className="btn btn-danger btn-xs" onClick={() => onDelete(b)}>Eliminar</button>
            </div>
          </div>
        ))}
        {!loading && brands.length === 0 && <p className="no-results">No hay marcas.</p>}
        {loading && <p className="no-results">Cargando marcas...</p>}
      </div>

      {pages > 1 && (
        <div className="pagination">
          {pageNumbers.map((p, i) => (
            <button
              key={`${p}-${i}`}
              type="button"
              className={`page-btn ${p === pageSafe ? 'active' : ''}`}
              onClick={() => typeof p === 'number' && onPage(p)}
              disabled={typeof p !== 'number'}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {renaming && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal admin-modal-sm" onSubmit={submitRename}>
            <div className="admin-modal-head">
              <h3>Renombrar marca</h3>
              <button type="button" className="admin-close" onClick={() => setRenaming(null)} aria-label="Cerrar">✕</button>
            </div>
            <label className="admin-full">
              Nuevo nombre
              <input autoFocus value={renamingValue} onChange={e => setRenamingValue(e.target.value)} />
            </label>
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setRenaming(null)} disabled={busy}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={busy}>Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function BrandDeleteDialog({ brand, busy, onDeleteProducts, onDeleteBrand, onCancel }) {
  const count = brand.count
  return (
    <div className="admin-modal-backdrop admin-confirm-backdrop">
      <div className="admin-confirm" role="dialog" aria-modal="true">
        <span className="admin-confirm-icon">🗑️</span>
        <h3>Eliminar marca "{brand.name}"</h3>
        <p>{count} producto{count !== 1 ? 's' : ''} usa{count !== 1 ? 'n' : ''} esta marca. ¿Qué querés hacer?</p>
        <div className="admin-confirm-options">
          <button type="button" className="btn btn-danger" onClick={onDeleteProducts} disabled={busy}>
            Eliminar también sus {count} producto{count !== 1 ? 's' : ''}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onDeleteBrand} disabled={busy}>
            Solo quitar la marca (los productos quedan sin marca)
          </button>
        </div>
        <button type="button" className="btn btn-ghost btn-block" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        {busy && <p className="admin-hint">Eliminando...</p>}
      </div>
    </div>
  )
}

function ToastList({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} role="status">
          <span className="toast-icon">{t.type === 'success' ? '✓' : t.type === 'danger' ? '✕' : 'ℹ'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', busy = false, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-backdrop admin-confirm-backdrop">
      <div className="admin-confirm" role="dialog" aria-modal="true">
        <span className="admin-confirm-icon">🗑️</span>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="admin-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Admin() {
  const [authed, setAuthed] = useState(Boolean(getToken()))
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('productos')
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [pendingBrandDelete, setPendingBrandDelete] = useState(null)
  const [brandDeleting, setBrandDeleting] = useState(false)
  const [allBrands, setAllBrands] = useState([])
  const [brands, setBrands] = useState([])
  const [brandSearch, setBrandSearch] = useState('')
  const [brandPage, setBrandPage] = useState(1)
  const [brandTotal, setBrandTotal] = useState(0)
  const [brandPages, setBrandPages] = useState(1)
  const [brandLoading, setBrandLoading] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  const [pagesCount, setPagesCount] = useState(1)
  const toastId = useRef(0)
  const latestReq = useRef(0)

  const notify = (msg, type = 'success') => {
    toastId.current += 1
    const id = toastId.current
    setToasts(list => [...list, { id, msg, type }])
    window.setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), TOAST_MS)
  }

  const loadPage = useCallback(async () => {
    const req = ++latestReq.current
    setLoading(true)
    setError('')
    try {
      const data = await api.fetchProducts({
        search,
        brand: brandFilter,
        category: catFilter,
        page,
        limit: PAGE_SIZE,
      })
      if (req !== latestReq.current) return
      setProducts(data.products)
      setTotalProducts(data.total)
      setPagesCount(data.pages)
      if (data.pages > 0 && data.page > data.pages) setPage(data.pages)
    } catch (err) {
      if (req !== latestReq.current) return
      setError(err.message)
    } finally {
      if (req === latestReq.current) setLoading(false)
    }
  }, [search, brandFilter, catFilter, page])

  const loadBrands = useCallback(async (overrides = {}) => {
    const search = overrides.search !== undefined ? overrides.search : brandSearch
    const page = overrides.page !== undefined ? overrides.page : brandPage
    setBrandLoading(true)
    try {
      const data = await api.fetchBrands({ search, page, limit: 8 })
      setBrands(data.brands)
      setBrandTotal(data.total)
      setBrandPages(Math.max(1, data.pages))
      if (overrides.search !== undefined) setBrandSearch(overrides.search)
      if (overrides.page !== undefined) setBrandPage(overrides.page)
    } catch {
      /* las marcas quedan vacías hasta que cargue */
    } finally {
      setBrandLoading(false)
    }
  }, [brandSearch, brandPage])

  const loadAllBrands = useCallback(async () => {
    try {
      const data = await api.fetchBrands({ limit: 200 })
      const sorted = [...data.brands].sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      )
      setAllBrands(sorted)
    } catch {
      /* si falla, el formulario queda con la lista previa */
    }
  }, [])

  const handleLogin = () => {
    setError('')
    setAuthed(true)
  }

  useEffect(() => {
    if (!authed) return
    const t = setTimeout(() => {
      loadPage()
    }, 250)
    return () => clearTimeout(t)
  }, [authed, loadPage])

  useEffect(() => {
    if (!authed) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBrands()
  }, [authed, loadBrands])

  useEffect(() => {
    if (!authed) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllBrands()
  }, [authed, loadAllBrands])

  const brandList = allBrands

  const totalPages = Math.max(1, pagesCount)
  const pageSafe = Math.min(page, totalPages)
  const visible = products

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
    loadAllBrands()
  }

  const openEdit = p => {
    setEditing(p)
    setFormOpen(true)
    loadAllBrands()
  }

  const submitForm = async data => {
    let result
    if (data.id) {
      result = await api.updateProduct(data.id, data)
      notify('Producto editado correctamente')
    } else {
      result = await api.createProduct(data)
      notify('Producto agregado correctamente')
    }
    setFormOpen(false)
    await loadPage()
    return result
  }

  const setStock = async (p, value) => {
    const stock = Math.max(0, Number(value) || 0)
    try {
      await api.updateProduct(p.id, { stock })
      setProducts(list => list.map(x => (x.id === p.id ? { ...x, stock } : x)))
    } catch (err) {
      notify(err.message, 'danger')
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.deleteProduct(pendingDelete.id)
      notify(`Producto "${pendingDelete.name}" eliminado`)
      setPendingDelete(null)
      await loadPage()
    } catch (err) {
      notify(err.message, 'danger')
    } finally {
      setDeleting(false)
    }
  }

  const refreshBrands = () => loadBrands({ search: '', page: 1 })

  const handleCreateBrand = async name => {
    await api.createBrand(name)
    notify(`Marca "${name}" creada`)
    await refreshBrands()
  }

  const handleRenameBrand = async (oldName, newName) => {
    await api.renameBrand(oldName, newName)
    notify(`Marca renombrada a "${newName}"`)
      await Promise.all([loadPage(), refreshBrands()])
  }

  const runBrandDelete = async (mode, successMsg, reloadProducts) => {
    if (!pendingBrandDelete) return
    setBrandDeleting(true)
    try {
      await api.deleteBrand(pendingBrandDelete.name, { products: mode })
      notify(successMsg)
      setPendingBrandDelete(null)
      if (reloadProducts) {
        await loadPage()
      }
      await refreshBrands()
    } catch (err) {
      notify(err.message, 'danger')
    } finally {
      setBrandDeleting(false)
    }
  }

  const deleteBrandWithProducts = () =>
    runBrandDelete(
      'delete',
      `Marca "${pendingBrandDelete?.name}" y sus productos eliminados`,
      true
    )

  const deleteBrandOnly = () =>
    runBrandDelete(
      'unbrand',
      `Marca "${pendingBrandDelete?.name}" eliminada de los productos`,
      true
    )

  const logout = () => {
    setToken(null)
    setAuthed(false)
    setProducts([])
    setTotalProducts(0)
    setPagesCount(1)
    setAllBrands([])
    setBrands([])
    setBrandSearch('')
    setBrandPage(1)
    setBrandTotal(0)
    setBrandPages(1)
    setBrandLoading(false)
    setSearch('')
    setBrandFilter('')
    setCatFilter('')
    setPage(1)
  }

  if (!authed) return <Login onLogin={handleLogin} />

  return (
    <div className="admin">
      <div className="admin-header">
        <div>
          <span className="section-badge">🛠 Backoffice</span>
          <h2>Administración</h2>
        </div>
        <div className="admin-header-actions">
          <Link to="/" className="btn btn-ghost btn-sm">Ver tienda</Link>
          <button type="button" className="btn btn-danger btn-sm" onClick={logout}>Salir</button>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-tabs">
        <button type="button" className={tab === 'productos' ? 'active' : ''} onClick={() => setTab('productos')}>Productos</button>
        <button type="button" className={tab === 'marcas' ? 'active' : ''} onClick={() => setTab('marcas')}>Marcas</button>
      </div>

      {tab === 'productos' && (
        <div className="admin-tab">
          <div className="admin-toolbar">
            <input
              className="admin-search"
              placeholder="Buscar por nombre, marca o categoría..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
            <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1) }}>
              <option value="">Todas las marcas</option>
              {brandList.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}>
              <option value="">Todas las categorías</option>
              {categories.filter(c => c !== 'todos').map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button type="button" className="btn btn-primary" onClick={openNew}>+ Nuevo producto</button>
          </div>

          <p className="results-count">{loading ? 'Cargando...' : `${totalProducts} producto${totalProducts !== 1 ? 's' : ''}`}</p>

          <div className="admin-table">
            {!loading && visible.map(p => (
              <div className="admin-table-row admin-product-row" key={p.id}>
                <img src={p.image || '/products/placeholder.jpg'} alt="" className="admin-thumb" />
                <div className="admin-product-info">
                  <span className="admin-product-name">{p.name}</span>
                  <span className="admin-hint">{p.brand || 'Sin marca'} · {p.category}{!p.active ? ' · oculto' : ''}</span>
                </div>
                <span className="admin-price">{formatPrice(p.price)}</span>
                <input
                  type="number"
                  min="0"
                  value={p.stock}
                  onChange={e => setStock(p, e.target.value)}
                  className="admin-stock"
                  title="Stock (0 = sin stock)"
                  aria-label="Stock"
                />
                <div className="admin-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Editar</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setPendingDelete(p)}>Eliminar</button>
                </div>
              </div>
            ))}
            {!loading && visible.length === 0 && <p className="no-results">No hay resultados.</p>}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - pageSafe) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => (
                  <button
                    key={`${p}-${i}`}
                    type="button"
                    className={`page-btn ${p === pageSafe ? 'active' : ''}`}
                    onClick={() => typeof p === 'number' && setPage(p)}
                    disabled={typeof p !== 'number'}
                  >
                    {p}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === 'marcas' && (
        <BrandsPanel
          brands={brands}
          search={brandSearch}
          page={brandPage}
          total={brandTotal}
          pages={brandPages}
          loading={brandLoading}
          onCreate={handleCreateBrand}
          onRename={handleRenameBrand}
          onDelete={setPendingBrandDelete}
          onSearch={v => { setBrandPage(1); setBrandSearch(v) }}
          onPage={setBrandPage}
        />
      )}

      {formOpen && (
        <ProductForm
          initial={editing}
          brandList={allBrands}
          onSubmit={submitForm}
          onClose={() => setFormOpen(false)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="¿Eliminar producto?"
          message={`Se va a eliminar "${pendingDelete.name}" del catálogo. Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {pendingBrandDelete && (
        <BrandDeleteDialog
          brand={pendingBrandDelete}
          busy={brandDeleting}
          onDeleteProducts={deleteBrandWithProducts}
          onDeleteBrand={deleteBrandOnly}
          onCancel={() => setPendingBrandDelete(null)}
        />
      )}

      <ToastList toasts={toasts} />
    </div>
  )
}

export default Admin