import { useState } from 'react'
import { categories } from '../../data/products/products'
import { STAGE_TAGS, SIZE_TAGS } from '../../data/filters/filters'
import './FilterModal.css'

export default function FilterModal({ open, initial, facets, brands = [], onApply, onClose }) {
  const [category, setCategory] = useState(initial.category)
  const [marca, setMarca] = useState(initial.marca)
  const [etapa, setEtapa] = useState(initial.etapa)
  const [tamano, setTamano] = useState(initial.tamano)
  const [raza, setRaza] = useState(initial.raza)
  const [sort, setSort] = useState(initial.sort)
  const [marcaInput, setMarcaInput] = useState(initial.marca === 'todos' ? '' : initial.marca)
  const [marcaOpen, setMarcaOpen] = useState(false)

  const brandOptions = brands.length > 0 ? brands : facets?.brands || []
  const breedOptions = facets?.breeds || []

  if (!open) return null

  const reset = () => {
    setCategory('todos')
    setMarca('todos')
    setMarcaInput('')
    setMarcaOpen(false)
    setEtapa('todos')
    setTamano('todos')
    setRaza('todos')
    setSort('')
  }

  const apply = () => onApply({
    category,
    marca,
    etapa,
    tamano,
    raza,
    sort,
  })

  const selectMarca = name => {
    setMarca(name === '' ? 'todos' : name)
    setMarcaInput(name)
    setMarcaOpen(false)
  }

  const filteredBrands = brandOptions.filter(b =>
    b.name.toLowerCase().includes(marcaInput.toLowerCase())
  )

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
            <span className="filter-label">Precio</span>
            <select
              className="filter-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="">Ordenar por</option>
              <option value="price">Menor precio</option>
              <option value="-price">Mayor precio</option>
            </select>
          </div>

          <div className="filter-modal-group">
            <span className="filter-label">Marca</span>
            <div className="filter-brand-search">
              <input
                className="filter-select filter-brand-input"
                type="text"
                value={marcaInput}
                placeholder="Escribí para buscar una marca..."
                onChange={e => {
                  setMarcaInput(e.target.value)
                  setMarcaOpen(true)
                  if (e.target.value === '') setMarca('todos')
                }}
                onFocus={() => setMarcaOpen(true)}
                onBlur={() => setTimeout(() => setMarcaOpen(false), 150)}
              />
              {marcaOpen && (
                <div className="filter-brand-dropdown">
                  <button
                    type="button"
                    className={`filter-brand-item ${marca === 'todos' ? 'active' : ''}`}
                    onMouseDown={() => selectMarca('')}
                  >
                    Todas las marcas
                  </button>
                  {filteredBrands.map(b => (
                    <button
                      key={b.name}
                      type="button"
                      className={`filter-brand-item ${marca === b.name ? 'active' : ''}`}
                      onMouseDown={() => selectMarca(b.name)}
                    >
                      {b.name}
                    </button>
                  ))}
                  {filteredBrands.length === 0 && (
                    <span className="filter-brand-empty">Sin resultados</span>
                  )}
                </div>
              )}
            </div>
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