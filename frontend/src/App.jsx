import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Catalogo from './pages/Catalogo';
import DetalleProducto from './pages/DetalleProducto';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import { CarritoProvider } from './context/CarritoContext';

function App() {
  return (
    <CarritoProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main className="container" style={{ flexGrow: 1, padding: '40px 0' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/producto/:id" element={<DetalleProducto />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CarritoProvider>
  );
}

export default App;
