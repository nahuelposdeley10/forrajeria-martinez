import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import { Navbar, Footer, FloatingWhatsApp } from './components/Layout'
import Cart from './components/Cart'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'

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

  return (
    <>
      <ScrollToTop />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <Outlet />
      <Footer />
      <FloatingWhatsApp />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
      </Route>
    </Routes>
  )
}

export default App
