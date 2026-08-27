import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/products'
import { WhatsAppIcon } from './Layout'

export default function Cart({ open, onClose }) {
  const { items, total, count, removeItem, updateQty, clearCart, buildWhatsAppMessage } = useCart()

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
            <button className="btn btn-primary" onClick={onClose}>
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Menos">−</button>
                      <span className="cart-item-qty">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Más">+</button>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Quitar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <button className="cart-clear" onClick={clearCart}>
                Vaciar carrito
              </button>
              <div className="cart-total">
                <span>{count} {count === 1 ? 'producto' : 'productos'}</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <a
                href={buildWhatsAppMessage()}
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
