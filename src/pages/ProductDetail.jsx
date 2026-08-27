import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { products, formatPrice, WHATSAPP_NUMBER } from '../data/products'
import { WhatsAppIcon } from '../components/Layout'
import { useCart } from '../context/CartContext'
import { flyToCart } from '../utils/flyToCart'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    const from = document.querySelector('.detail-actions .btn-primary')
    const to = document.querySelector('.cart-button')
    flyToCart({ image: product.image, from, to })
    addItem(product)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1500)
  }

  if (!product) {
    return <Navigate to="/" replace />
  }

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Quiero consultar por: ${product.name} (${formatPrice(product.price)})`
  )}`

  return (
    <>
      <div className="detail-hero-spacer"></div>
      <section className="detail-section">
        <div className="section-container">
          <Link to="/#productos" className="detail-back">
            ← Volver a productos
          </Link>

          <div className="detail-grid">
            <div className="detail-media">
              {product.badge && <span className="product-badge">{product.badge}</span>}
              <img src={product.image} alt={product.name} />
            </div>

            <div className="detail-content">
              <span className="product-category">{product.brand || product.category}</span>
              <h1>{product.name}</h1>
              <p className="detail-description">{product.description}</p>

              <div className="detail-price">{formatPrice(product.price)}</div>

              <div className="detail-features">
                <h3>Características</h3>
                <ul>
                  {product.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleAdd}
                >
                  {justAdded ? '✓ Agregado al carrito' : '🛒 Agregar al carrito'}
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <WhatsAppIcon /> Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related-section">
          <div className="section-container">
            <span className="section-badge">🛍️ También te puede interesar</span>
            <h2>Productos similares</h2>
            <div className="products-grid">
              {related.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/producto/${product.id}`} className="product-media">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </Link>
                  <div className="product-info">
                    <span className="product-category">{product.brand || product.category}</span>
                    <h3>{product.name}</h3>
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
      )}
    </>
  )
}
