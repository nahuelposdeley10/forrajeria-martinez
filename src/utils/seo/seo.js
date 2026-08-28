export const SITE_URL = 'https://forrajeria-martinez.vercel.app'
export const SITE_NAME = 'Forrajeria Martinez'
export const SITE_DESCRIPTION =
  'Forrajeria Martinez - Todo para tu mascota. Alimentos, accesorios e higiene de las mejores marcas, con envíos a domicilio y los mejores precios.'

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

export function setSEO({ title, description, image, url, type = 'website' }) {
  if (title) document.title = title

  if (description) setMeta('name', 'description', description)

  setMeta('property', 'og:title', title || SITE_NAME)
  setMeta('property', 'og:description', description || SITE_DESCRIPTION)
  setMeta('property', 'og:type', type)
  setMeta('property', 'og:site_name', SITE_NAME)
  if (url) setMeta('property', 'og:url', url)
  if (image) setMeta('property', 'og:image', image)

  setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  setMeta('name', 'twitter:title', title || SITE_NAME)
  setMeta('name', 'twitter:description', description || SITE_DESCRIPTION)
  if (image) setMeta('name', 'twitter:image', image)

  let canonicalEl = document.head.querySelector('link[rel="canonical"]')
  if (!canonicalEl) {
    canonicalEl = document.createElement('link')
    canonicalEl.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalEl)
  }
  canonicalEl.setAttribute('href', url || window.location.origin + window.location.pathname)
}

export function setJsonLd(data) {
  removeJsonLd()
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'seo-jsonld'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export function removeJsonLd() {
  const existing = document.getElementById('seo-jsonld')
  if (existing) existing.remove()
}
