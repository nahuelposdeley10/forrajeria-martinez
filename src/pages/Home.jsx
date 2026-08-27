import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products, categories, formatPrice, WHATSAPP_NUMBER } from '../data/products'
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
          <a href="#productos" className="btn btn-primary">
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

  const filtered = activeCategory === 'todos'
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <section id="productos" className="products-section">
      <div className="section-container">
        <span className="section-badge">🛒 Nuestros productos</span>
        <h2>Encontra todo para tu mascota</h2>
        <p className="section-subtitle">Alimentos, accesorios, higiene y mucho más. Hacé tu pedido por WhatsApp.</p>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filtered.map(product => (
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
      </div>
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
