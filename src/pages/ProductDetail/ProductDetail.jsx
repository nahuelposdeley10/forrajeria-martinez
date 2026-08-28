import { useEffect, useState } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { formatPrice, WHATSAPP_NUMBER } from '../../data/products/products'
import { catalogApi } from '../../data/catalogApi/catalogApi'
import { WhatsAppIcon } from '../../components/Layout/Layout'
import { DetailSkeleton } from '../../components/Skeleton/Skeleton'
import { useCart } from '../../context/Cart/CartContext'
import { flyToCart } from '../../utils/flyToCart/flyToCart'
import { setSEO, setJsonLd, SITE_URL, SITE_NAME } from '../../utils/seo/seo'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setRelated([])

    catalogApi
      .fetchProduct(id)
      .then(async res => {
        const p = res.product
        if (!alive) return
        setProduct(p)
        const images = Array.isArray(p.images) && p.images.length ? p.images : [p.image]
        setSEO({
          title: `${p.name} | ${SITE_NAME}`,
          description: p.description || `${p.name} disponible en ${SITE_NAME}. Hacé tu pedido por WhatsApp.`,
          url: `${SITE_URL}/producto/${p.id}`,
          type: 'product',
          image: images[0],
        })
        setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          image: images.filter(Boolean),
          description: p.description || undefined,
          brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
          category: p.category,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'ARS',
            price: p.price,
            availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        })
        try {
          const rel = await catalogApi.fetchProducts({ category: p.category, limit: 3 })
          if (alive) setRelated(rel.products.filter(x => x.id !== p.id).slice(0, 3))
        } catch {
          /* relacionados opcionales */
        }
      })
      .catch(() => {
        if (alive) setNotFound(true)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [id])

  const goBackToProducts = () => {
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById('productos')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 120)
  }

  const handleAdd = () => {
    const from = document.querySelector('.detail-actions .btn-primary')
    const to = document.querySelector('.cart-button')
    flyToCart({ image: product.image, from, to })
    addItem(product)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1500)
  }

  if (loading && !product) {
    return (
      <>
        <div className="detail-hero-spacer"></div>
        <section className="detail-section">
          <div className="section-container">
            <span className="detail-back">← Volver a productos</span>
            <DetailSkeleton />
          </div>
        </section>
      </>
    )
  }

  if (notFound || !product) {
    return <Navigate to="/" replace />
  }

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Quiero consultar por: ${product.name} (${formatPrice(product.price)})`
  )}`

  return (
    <>
      <div className="detail-hero-spacer"></div>
      <section className="detail-section">
        <div className="section-container">
          <button className="detail-back" onClick={goBackToProducts}>
            ← Volver a productos
          </button>

          <div className="detail-grid">
            <div className="detail-media">
              {product.badge && <span className="product-badge">{product.badge}</span>}
              {product.stock <= 0 && <span className="product-badge product-badge-stock">Sin stock</span>}
              <img src={product.image || '/products/placeholder.jpg'} alt={product.name} fetchPriority="high" decoding="async" className={product.stock <= 0 ? 'out' : ''} />
            </div>

            <div className="detail-content">
              <span className="product-category">{product.brand || product.category}</span>
              <h1>{product.name}</h1>
              <p className="detail-description">{product.description}</p>

              <div className="detail-price">
                {formatPrice(product.price)}
                {product.stock <= 0 && (
                  <span className="detail-stock">{product.stock === 0 ? 'Sin stock' : `${product.stock} disponibles`}</span>
                )}
              </div>

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
                  disabled={product.stock <= 0}
                >
                  {product.stock <= 0
                    ? 'Sin stock'
                    : justAdded ? '✓ Agregado al carrito' : '🛒 Agregar al carrito'}
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
                    {product.stock <= 0 && <span className="product-badge product-badge-stock">Sin stock</span>}
                    <img src={product.image || '/products/placeholder.jpg'} alt={product.name} loading="lazy" decoding="async" className={product.stock <= 0 ? 'out' : ''} />
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
