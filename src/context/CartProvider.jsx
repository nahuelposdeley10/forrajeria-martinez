import { useMemo, useState, useEffect, useRef } from 'react'
import { CartContext } from './CartContext'
import { formatPrice } from '../data/products'

const STORAGE_KEY = 'forrajeria-cart'
const WHATSAPP_NUMBER = '5491130674658'

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [lastAdded, setLastAdded] = useState(null)
  const lastAddedTimer = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // storage no disponible
    }
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, { ...product, qty }]
    })
    setLastAdded(product)
    if (lastAddedTimer.current) clearTimeout(lastAddedTimer.current)
    lastAddedTimer.current = setTimeout(() => setLastAdded(null), 2500)
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty } : i)))
  }

  const clearCart = () => setItems([])

  const { total, count } = useMemo(() => {
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const count = items.reduce((sum, i) => sum + i.qty, 0)
    return { total, count }
  }, [items])

  const buildWhatsAppMessage = () => {
    const lines = items.map(i => `• ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}`)
    const message = [
      'Hola! Quiero hacer el siguiente pedido:',
      '',
      ...lines,
      '',
      `TOTAL: ${formatPrice(total)}`,
    ].join('\n')
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  const value = {
    items,
    total,
    count,
    lastAdded,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    buildWhatsAppMessage,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
