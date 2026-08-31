import { useCallback, useEffect, useRef, useState } from 'react'
import { catalogApi } from '../../data/catalogApi/catalogApi'
import { WHATSAPP_NUMBER } from '../../data/products/products'
import { WhatsAppIcon } from '../Layout/Layout'
import './PromotionCarousel.css'

const AUTOPLAY_MS = 5000

function PromotionCarousel() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const timer = useRef(null)
  const len = promotions.length

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    if (len <= 1) return
    timer.current = setInterval(() => {
      setIndex(prev => (prev + 1) % len)
    }, AUTOPLAY_MS)
  }, [len])

  useEffect(() => {
    let alive = true
    catalogApi
      .fetchPromotions()
      .then(data => {
        if (alive) setPromotions(data.promotions || [])
      })
      .catch(() => {
        if (alive) setPromotions([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [resetTimer])

  const go = useCallback(
    i => {
      setIndex((i + len) % len)
      resetTimer()
    },
    [len, resetTimer]
  )

  if (loading) return null
  if (len === 0) return null

  return (
    <section className="promo-carousel" aria-label="Promociones">
      <div className="promo-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {promotions.map(p => {
          const msg = p.whatsappMessage || `Hola! Quiero consultar por la promoción: ${p.title}`
          return (
            <a
              key={p.id}
              className="promo-slide"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {p.image && <img src={p.image} alt={p.title} className="promo-slide-img" />}
              <div className="promo-slide-body">
                <span className="promo-badge">Promoción</span>
                <h3 className="promo-slide-title">{p.title}</h3>
                {p.description && <p className="promo-slide-desc">{p.description}</p>}
                <span className="promo-whatsapp-btn">
                  <WhatsAppIcon /> Consultar por WhatsApp
                </span>
              </div>
            </a>
          )
        })}
      </div>

      {len > 1 && (
        <>
          <button
            type="button"
            className="promo-arrow promo-arrow-prev"
            aria-label="Promoción anterior"
            onClick={() => go(index - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="promo-arrow promo-arrow-next"
            aria-label="Promoción siguiente"
            onClick={() => go(index + 1)}
          >
            ›
          </button>

          <div className="promo-dots">
            {promotions.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`promo-dot${i === index ? ' active' : ''}`}
                aria-label={`Ir a la promoción ${i + 1}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default PromotionCarousel
