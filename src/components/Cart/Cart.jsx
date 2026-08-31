import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/Cart/CartContext'
import { formatPrice } from '../../data/products/products'
import { WhatsAppIcon } from '../Layout/Layout'
import './Cart.css'

export default function Cart({ open, onClose, addedId }) {
  const { items, total, count, removeItem, updateQty, clearCart, buildWhatsAppMessage } = useCart()
  const [highlightId, setHighlightId] = useState(null)
  const [prevAddedId, setPrevAddedId] = useState(null)
  const [delivery, setDelivery] = useState(false)
  const [address, setAddress] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const goToProducts = () => {
    onClose()
    const scroll = () => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
    if (location.pathname === '/') {
      scroll()
    } else {
      navigate('/')
      setTimeout(scroll, 120)
    }
  }

  const deliveryLines = delivery
    ? [`Dirección de entrega: ${address.trim() || 'a confirmar'}`]
    : []
  const checkoutHref = buildWhatsAppMessage(deliveryLines)

  if (addedId !== prevAddedId) {
    setPrevAddedId(addedId)
    setHighlightId(addedId)
  }

  useEffect(() => {
    if (!addedId) return
    const timer = setTimeout(() => setHighlightId(null), 2200)
    return () => clearTimeout(timer)
  }, [addedId])

  if (!open) return null

  return (
    <>
      <div className="cart-overlay" onClick={onClose}></div>
      <aside className="cart-panel">
        <div className="cart-header">
          <h2>Tu carrito</h2>
          <button className="cart-close" onClick={onClose} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <p>Tu carrito está vacío</p>
            <button className="btn btn-primary" onClick={goToProducts}>
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`cart-item${item.id === highlightId ? ' added' : ''}`}
                >
                  <img src={item.image || '/products/placeholder.jpg'} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Menos">−</button>
                      <span className="cart-item-qty">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Más">+</button>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Eliminar producto"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <button className="cart-clear" onClick={clearCart}>
                Vaciar carrito
              </button>

              <div className="cart-delivery">
                <label className="cart-delivery-toggle">
                  <input
                    type="checkbox"
                    checked={delivery}
                    onChange={(e) => setDelivery(e.target.checked)}
                  />
                  <span>🚚 Envío a domicilio</span>
                </label>
                {delivery && (
                  <input
                    type="text"
                    className="cart-delivery-address"
                    placeholder="Dirección de entrega (calle, número, ciudad)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                )}
              </div>

              <div className="cart-total">
                <span>{count} {count === 1 ? 'producto' : 'productos'}</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <a
                href={checkoutHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp cart-checkout"
              >
                <WhatsAppIcon /> Enviar pedido por WhatsApp
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
