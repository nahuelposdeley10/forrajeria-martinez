import { useMemo, useState } from 'react'
import { products, categories } from '../data/products'
import { STAGE_TAGS, SIZE_TAGS, BREED_DEFS, toKey } from '../data/filters'

export default function FilterModal({ open, initial, onApply, onClose }) {
  const [category, setCategory] = useState(initial.category)
  const [marca, setMarca] = useState(initial.marca)
  const [etapa, setEtapa] = useState(initial.etapa)
  const [tamano, setTamano] = useState(initial.tamano)
  const [raza, setRaza] = useState(initial.raza)

  const brandOptions = useMemo(() => {
    const counts = {}
    products.forEach(p => { counts[p.brand] = (counts[p.brand] || 0) + 1 })
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])
  }, [])

  const breedOptions = useMemo(
    () => BREED_DEFS.filter(d => products.some(p => d.re.test(toKey(p.name)))),
    []
  )

  if (!open) return null

  const reset = () => {
    setCategory('todos')
    setMarca('todos')
    setEtapa('todos')
    setTamano('todos')
    setRaza('todos')
  }

  const apply = () => onApply({ category, marca, etapa, tamano, raza })

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="filter-modal" role="dialog" aria-modal="true" aria-label="Filtros de productos">
        <div className="filter-modal-header">
          <h3>Filtros</h3>
          <button className="filter-modal-close" onClick={onClose} aria-label="Cerrar filtros">
            ✕
          </button>
        </div>

        <div className="filter-modal-body">
          <div className="filter-modal-group">
            <span className="filter-label">Categoría</span>
            <div className="filter-chips">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-modal-group">
            <span className="filter-label">Marca</span>
            <select
              className="filter-select"
              value={marca}
              onChange={e => setMarca(e.target.value)}
            >
              <option value="todos">Todas las marcas</option>
              {brandOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-modal-group">
            <span className="filter-label">Etapa</span>
            <div className="filter-chips">
              <button
                className={`filter-chip ${etapa === 'todos' ? 'active' : ''}`}
                onClick={() => setEtapa('todos')}
              >
                Todas
              </button>
              {STAGE_TAGS.map(t => (
                <button
                  key={t.key}
                  className={`filter-chip ${etapa === t.key ? 'active' : ''}`}
                  onClick={() => setEtapa(etapa === t.key ? 'todos' : t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tamano && (
            <div className="filter-modal-group">
              <span className="filter-label">Tamaño</span>
              <div className="filter-chips">
                <button
                  className={`filter-chip ${tamano === 'todos' ? 'active' : ''}`}
                  onClick={() => setTamano('todos')}
                >
                  Todos
                </button>
                {SIZE_TAGS.map(t => (
                  <button
                    key={t.key}
                    className={`filter-chip ${tamano === t.key ? 'active' : ''}`}
                    onClick={() => setTamano(tamano === t.key ? 'todos' : t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {breedOptions.length > 0 && (
            <div className="filter-modal-group">
              <span className="filter-label">Raza</span>
              <select
                className="filter-select"
                value={raza}
                onChange={e => setRaza(e.target.value)}
              >
                <option value="todos">Todas las razas</option>
                {breedOptions.map(b => (
                  <option key={b.key} value={b.key}>{b.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="filter-modal-footer">
          <button className="filter-reset" onClick={reset}>
            Limpiar filtros
          </button>
          <button className="filter-apply" onClick={apply}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </>
  )
}