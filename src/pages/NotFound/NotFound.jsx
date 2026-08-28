import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  const goToProducts = () => {
    setTimeout(() => {
      const el = document.getElementById('productos')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 120)
  }

  return (
    <section className="notfound-section">
      <div className="section-container">
        <div className="notfound-card">
          <span className="notfound-code">404</span>
          <span className="notfound-emoji">🐾</span>
          <h1>Página no encontrada</h1>
          <p>
            Uy... parece que este producto o página no existe en nuestra tienda,
            o puede que haya cambiado de lugar.
          </p>
          <div className="notfound-actions">
            <Link to="/" className="btn btn-primary">Volver al inicio</Link>
            <Link to="/" onClick={goToProducts} className="btn btn-whatsapp">Ver productos</Link>
          </div>
        </div>
      </div>
    </section>
  )
}