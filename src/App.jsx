import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Navbar, Footer, FloatingWhatsApp } from './components/Layout/Layout'
import Cart from './components/Cart/Cart'
import { useCart } from './context/Cart/CartContext'
import Home from './pages/Home/Home'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Admin from './pages/Admin/Admin'
import NotFound from './pages/NotFound/NotFound'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [pathname, hash])
  return null
}

function Layout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { lastAdded } = useCart()
  const prevAddedId = useRef(null)

  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    const isNewAdd = lastAdded && lastAdded.id !== prevAddedId.current
    if (isNewAdd) prevAddedId.current = lastAdded.id
    if (isNewAdd && isMobile) {
      const timer = setTimeout(() => setCartOpen(true), 680)
      return () => clearTimeout(timer)
    }
  }, [lastAdded])

  return (
    <>
      <ScrollToTop />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <Outlet />
      <Footer />
      <FloatingWhatsApp />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} addedId={lastAdded?.id} />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
