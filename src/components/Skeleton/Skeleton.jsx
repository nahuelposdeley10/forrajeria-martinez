import './Skeleton.css'

export function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className="products-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="product-card skeleton-card" key={i}>
          <span className="spinner" aria-hidden="true"></span>
          <div className="skeleton skeleton-media"></div>
          <div className="product-info">
            <div className="skeleton skeleton-line w-20"></div>
            <div className="skeleton skeleton-line w-80"></div>
            <div className="skeleton skeleton-text w-95"></div>
            <div className="product-footer">
              <div className="skeleton skeleton-line w-30"></div>
              <div className="skeleton skeleton-btn"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="detail-grid detail-skeleton" aria-hidden="true">
      <span className="spinner spinner-lg" aria-hidden="true"></span>
      <div className="skeleton skeleton-detail-media"></div>
      <div className="detail-content">
        <div className="skeleton skeleton-line w-25"></div>
        <div className="skeleton skeleton-line w-75 h-28"></div>
        <div className="skeleton skeleton-text w-90"></div>
        <div className="skeleton skeleton-text w-60"></div>
        <div className="skeleton skeleton-line w-40 h-28 mt-24"></div>
        <div className="skeleton skeleton-line w-90 mt-24"></div>
        <div className="skeleton skeleton-line w-80 mt-12"></div>
        <div className="skeleton skeleton-line w-70 mt-12"></div>
        <div className="skeleton skeleton-line w-85 mt-12"></div>
      </div>
    </div>
  )
}