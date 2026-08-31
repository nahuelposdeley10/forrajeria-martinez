import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, formatPrice, WHATSAPP_NUMBER } from '../../data/products/products'
import { catalogApi } from '../../data/catalogApi/catalogApi'
import FilterModal from '../../components/FilterModal/FilterModal'
import { ProductGridSkeleton } from '../../components/Skeleton/Skeleton'
import { WhatsAppIcon } from '../../components/Layout/Layout'
import { setSEO, setJsonLd, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '../../utils/seo/seo'
import './Home.css'

function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <span className="hero-badge">🐾 Tu tienda de confianza</span>
        <h1>Forrajeria Martinez</h1>
        <p>Todo lo que tu mascota necesita, con la mejor calidad y precios imbatibles. Hacemos envíos a domicilio.</p>
        <div className="hero-buttons">
          <a
            href="#productos"
            className="btn btn-primary"
            onClick={e => {
              e.preventDefault()
              document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Ver productos
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero hacer una consulta')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
          >
            <WhatsAppIcon /> Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}

function Products() {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [marca, setMarca] = useState('todos')
  const [etapa, setEtapa] = useState('todos')
  const [tamano, setTamano] = useState('todos')
  const [raza, setRaza] = useState('todos')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [data, setData] = useState({ products: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [facets, setFacets] = useState(null)
  const [brandOptions, setBrandOptions] = useState([])
  const PAGE_SIZE = 12
  const gridRef = useRef(null)
  const latestReq = useRef(0)

  const load = useCallback(async () => {
    const req = ++latestReq.current
    setLoading(true)
    setError('')
    try {
      const res = await catalogApi.fetchProducts({
        category: activeCategory,
        brand: marca,
        stage: etapa,
        size: tamano,
        breed: raza,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        search,
        page,
        limit: PAGE_SIZE,
      })
      if (req !== latestReq.current) return
      setData({ products: res.products, total: res.total, pages: res.pages })
      if (res.pages > 0 && res.page > res.pages) setPage(res.pages)
    } catch (err) {
      if (req !== latestReq.current) return
      setError(err.message)
      setData({ products: [], total: 0, pages: 1 })
    } finally {
      if (req === latestReq.current) setLoading(false)
    }
  }, [activeCategory, marca, etapa, tamano, raza, minPrice, maxPrice, search, page])

  useEffect(() => {
    const t = setTimeout(load, page > 1 ? 0 : 250)
    return () => clearTimeout(t)
  }, [load, page])

  useEffect(() => {
    let alive = true
    catalogApi
      .fetchFacets({ category: activeCategory === 'todos' ? undefined : activeCategory })
      .then(f => {
        if (alive) setFacets(f)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [activeCategory])

  useEffect(() => {
    let alive = true
    catalogApi
      .fetchBrands()
      .then(data => {
        if (alive) setBrandOptions(data.brands)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const total = data.total
  const totalPages = Math.max(1, data.pages)
  const current = Math.min(page, totalPages)
  const visible = data.products
  const activeFilterCount = (activeCategory !== 'todos' ? 1 : 0) +
    (marca !== 'todos' ? 1 : 0) +
    (etapa !== 'todos' ? 1 : 0) +
    (tamano !== 'todos' ? 1 : 0) +
    (raza !== 'todos' ? 1 : 0) +
    (minPrice !== '' || maxPrice !== '' ? 1 : 0)

  const applyFilters = ({ category, marca: m, etapa: e, tamano: t, raza: r, minPrice: min, maxPrice: max }) => {
    setActiveCategory(category)
    setMarca(m)
    setEtapa(e)
    setTamano(t)
    setRaza(r)
    setMinPrice(min ?? '')
    setMaxPrice(max ?? '')
    setPage(1)
    setFiltersOpen(false)
  }

  const goTo = p => {
    setPage(p)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pageList = () => {
    const pages = []
    const add = p => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p) }
    add(1)
    if (current > 4) pages.push('…')
    for (let p = current - 2; p <= current + 2; p++) add(p)
    if (current < totalPages - 3) pages.push('…')
    add(totalPages)
    return pages
  }

  return (
    <section id="productos" className="products-section">
      <div className="section-container">
        <span className="section-badge">🛒 Nuestros productos</span>
        <h2>Encontra todo para tu mascota</h2>
        <p className="section-subtitle">Alimentos, accesorios, higiene y mucho más. Hacé tu pedido por WhatsApp.</p>

        <div className="product-tools">
          <div className="search-box">
            <input
              type="search"
              placeholder="Buscar por nombre, marca o categoria..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
              aria-label="Buscar productos"
            />
          </div>
          <button className="filter-trigger" onClick={() => setFiltersOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filtros
            {activeFilterCount > 0 && (
              <span className="filter-trigger-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat)
                setPage(1)
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <p className="results-count">
          {error
            ? 'Error al cargar productos.'
            : loading
              ? 'Cargando...'
              : `${total} producto${total !== 1 ? 's' : ''}`}
        </p>

        {error ? (
          <p className="no-results">
            No se pudo conectar con el servidor.
            <button type="button" className="page-btn" onClick={load} style={{ marginLeft: '10px' }}>
              Reintentar
            </button>
          </p>
        ) : loading ? (
          <ProductGridSkeleton count={PAGE_SIZE} />
        ) : visible.length === 0 ? (
          <p className="no-results">No encontramos productos para tu busqueda.</p>
        ) : (
          <div className="products-grid" ref={gridRef}>
            {visible.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/producto/${product.id}`} className="product-media">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  {product.stock <= 0 && <span className="product-badge product-badge-stock">Sin stock</span>}
                  <img src={product.image || '/products/placeholder.jpg'} alt={product.name} loading="lazy" decoding="async" className={product.stock <= 0 ? 'out' : ''} />
                </Link>
                <div className="product-info">
                  <span className="product-category">{product.brand || 'Sin marca'}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <Link to={`/producto/${product.id}`} className="btn btn-detail-sm">
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Paginacion de productos">
            <button className="page-btn" disabled={current === 1} onClick={() => goTo(current - 1)}>
              &lsaquo; Anterior
            </button>
            {pageList().map((p, i) => p === '…'
              ? <span key={`dots-${i}`} className="page-dots">…</span>
              : (
                <button
                  key={p}
                  className={`page-btn ${p === current ? 'active' : ''}`}
                  onClick={() => goTo(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="page-btn"
              disabled={current === totalPages}
              onClick={() => goTo(current + 1)}
            >
              Siguiente &rsaquo;
            </button>
          </nav>
        )}
      </div>

      <FilterModal
        key={filtersOpen ? 'open' : 'closed'}
        open={filtersOpen}
        initial={{ category: activeCategory, marca, etapa, tamano, raza, minPrice, maxPrice }}
        facets={facets}
        brands={brandOptions}
        onApply={applyFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </section>
  )
}

function About() {
  return (
    <section id="nosotros" className="about-section">
      <div className="section-container">
        <div className="about-grid">
          <div className="about-content">
            <span className="section-badge">❤️ Sobre nosotros</span>
            <h2>Mas de 15 años cuidando a tus mascotas</h2>
            <p>
              En Forrajeria Martinez nos dedicamos con amor a brindar lo mejor para tus mascotas.
              Contamos con una amplia variedad de productos de las mejores marcas, precios accesibles
              y un equipo que siempre está dispuesto a ayudarte.
            </p>
            <div className="about-features">
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <div>
                  <strong>Envío gratis</strong>
                  <p>En compras superiores a $25.000</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">💳</span>
                <div>
                  <strong>Pagos flexibles</strong>
                  <p>Aceptamos efectivo, transferencia y tarjetas</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon">🏅</span>
                <div>
                  <strong>Calidad garantizada</strong>
                  <p>Solo vendemos productos que nosotros usaríamos</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-visual">
            <div className="about-card">
              <span className="about-emoji">🐕</span>
              <span className="about-emoji">🐈</span>
              <span className="about-emoji">🐦</span>
              <span className="about-emoji">🐹</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contacto" className="contact-section">
      <div className="section-container">
        <span className="section-badge">📍 Contacto</span>
        <h2>Visitanos o escribinos</h2>
        <p className="section-subtitle">Estamos para ayudarte. Consultá disponibilidad, precios y hacé tu pedido.</p>
        <div className="contact-grid">
          <div className="contact-card">
            <span className="contact-icon">📍</span>
            <h3>Dirección</h3>
            <p>Av. San Martín 1234, Buenos Aires</p>
          </div>
          <div className="contact-card">
            <span className="contact-icon">🕐</span>
            <h3>Horarios</h3>
            <p>Lun a Sáb: 9:00 - 19:00</p>
            <p>Domingos: 10:00 - 14:00</p>
          </div>
          <div className="contact-card">
            <span className="contact-icon">📞</span>
            <h3>Teléfono</h3>
            <p>+54 11 3067-4658</p>
          </div>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero hacer un pedido')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp btn-whatsapp-lg"
        >
          <WhatsAppIcon /> Hacer pedido por WhatsApp
        </a>
      </div>
    </section>
  )
}

export default function Home() {
  useEffect(() => {
    setSEO({ title: `${SITE_NAME} | Alimentos y accesorios para mascotas`, description: SITE_DESCRIPTION, url: SITE_URL })
    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: SITE_NAME,
      url: SITE_URL,
      telephone: '+54 11 3067-4658',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. San Martín 1234',
        addressLocality: 'Buenos Aires',
        addressCountry: 'AR',
      },
      openingHours: ['Mo-Sa 09:00-19:00', 'Su 10:00-14:00'],
      priceRange: '$',
    })
  }, [])

  return (
    <>
      <Hero />
      <Products />
      <About />
      <Contact />
    </>
  )
}