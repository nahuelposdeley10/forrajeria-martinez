export function flyToCart({ image, from, to, size = 90 }) {
  if (!image || !from || !to) return

  const fromRect = from.getBoundingClientRect()
  const toRect = to.getBoundingClientRect()

  const startX = fromRect.left + fromRect.width / 2
  const startY = fromRect.top + fromRect.height / 2
  const endX = toRect.left + toRect.width / 2
  const endY = toRect.top + toRect.height / 2

  const fly = document.createElement('div')
  fly.className = 'fly-to-cart'
  const img = document.createElement('img')
  img.src = image
  img.alt = ''
  fly.appendChild(img)
  document.body.appendChild(fly)

  fly.style.left = `${startX - size / 2}px`
  fly.style.top = `${startY - size / 2}px`

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${endX - startX}px, ${
        endY - startY
      }px) scale(0.2) rotate(-12deg)`
      fly.style.opacity = '0.85'
    })
  })

  const cleanup = () => {
    window.clearTimeout(cleanupTimer)
    fly.removeEventListener('transitionend', cleanup)
    if (fly.parentNode) fly.parentNode.removeChild(fly)
  }
  const cleanupTimer = window.setTimeout(cleanup, 950)
  fly.addEventListener('transitionend', cleanup)
}