import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, PawPrint, LogOut } from 'lucide-react';
import { CarritoContext } from '../context/CarritoContext';
import authService from '../services/authService';

const Navbar = () => {
  const { cantidadTotal } = useContext(CarritoContext);
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <PawPrint size={28} className="text-primary" style={{ transform: 'rotate(-10deg)', fill: 'var(--color-primary)' }} />
          <span>Petshop</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Inicio</Link>
          <Link to="/catalogo" className="navbar-item">Catálogo</Link>

          {currentUser ? (
            <>
              <Link to="/dashboard" className="navbar-item" style={{ display: 'flex', align_items: 'center', gap: '4px' }}>
                <User size={18} />
                <span>Mi Panel</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="navbar-item" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-danger)'
                }}
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-item" style={{ display: 'flex', align_items: 'center', gap: '4px' }}>
              <User size={18} />
              <span>Ingresar</span>
            </Link>
          )}

          <Link to="/checkout" className="navbar-item" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingBag size={20} />
            <span style={{ fontWeight: '600' }}>Carrito</span>
            {cantidadTotal > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  borderRadius: '999px',
                  padding: '2px 6px',
                  lineHeight: '1',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {cantidadTotal}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
