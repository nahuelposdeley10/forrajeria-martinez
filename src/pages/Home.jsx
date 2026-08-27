import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { products, categories, formatPrice, WHATSAPP_NUMBER } from '../data/products'
import { STAGE_TAGS, SIZE_TAGS, BREED_DEFS, toKey } from '../data/filters'
import FilterModal from '../components/FilterModal'
import { WhatsAppIcon } from '../components/Layout'

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
  const [filtersOpen, setFiltersOpen] = useState(false)
  const PAGE_SIZE = 12
  const gridRef = useRef(null)

  const filtered = useMemo(() => {
    const q = toKey(search).trim()
    let list = activeCategory === 'todos'
      ? products
      : products.filter(p => p.category === activeCategory)

    if (marca !== 'todos') {
      list = list.filter(p => p.brand === marca)
    }
    if (etapa !== 'todos') {
      const tag = STAGE_TAGS.find(t => t.key === etapa)
      if (tag) list = list.filter(p => tag.re.test(toKey(p.name)))
    }
    if (tamano !== 'todos') {
      const tag = SIZE_TAGS.find(t => t.key === tamano)
      if (tag) list = list.filter(p => tag.re.test(toKey(p.name)))
    }
    if (raza !== 'todos') {
      const def = BREED_DEFS.find(b => b.key === raza)
      if (def) list = list.filter(p => def.re.test(toKey(p.name)))
    }
    if (q) {
      list = list.filter(p =>
        toKey(p.name).includes(q) ||
        toKey(p.brand).includes(q) ||
        toKey(p.category).includes(q) ||
        toKey(p.description).includes(q)
      )
    }
    return list
  }, [activeCategory, search, marca, etapa, tamano, raza])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const activeFilterCount = (activeCategory !== 'todos' ? 1 : 0) +
    (marca !== 'todos' ? 1 : 0) +
    (etapa !== 'todos' ? 1 : 0) +
    (tamano !== 'todos' ? 1 : 0) +
    (raza !== 'todos' ? 1 : 0)

  const applyFilters = ({ category, marca: m, etapa: e, tamano: t, raza: r }) => {
    setActiveCategory(category)
    setMarca(m)
    setEtapa(e)
    setTamano(t)
    setRaza(r)
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

        <p className="results-count">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</p>

        {visible.length === 0 ? (
          <p className="no-results">No encontramos productos para tu busqueda.</p>
        ) : (
          <div className="products-grid" ref={gridRef}>
            {visible.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/producto/${product.id}`} className="product-media">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <img src={product.image} alt={product.name} loading="lazy" />
                </Link>
                <div className="product-info">
                  <span className="product-category">{product.brand || product.category}</span>
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
        initial={{ category: activeCategory, marca, etapa, tamano, raza }}
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
  return (
    <>
      <Hero />
      <Products />
      <About />
      <Contact />
    </>
  )
}
