import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ArrowRight, Heart, Shield, Award } from 'lucide-react';
import productoService from '../services/productoService';

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Load some featured products for the home page
    productoService.getProductos()
      .then(data => {
        setFeatured(data.slice(0, 3));
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Hero Banner */}
      <section style={{
        backgroundColor: 'var(--color-secondary)',
        padding: '80px 0',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        marginBottom: '60px'
      }}>
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(31, 78, 55, 0.1)',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--color-primary)'
          }}>
            <PawPrint size={14} style={{ fill: 'var(--color-primary)' }} />
            <span>BIENVENIDO A PETSHOP</span>
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.2', maxWidth: '800px' }}>
            Todo lo que tu mascota necesita, en un solo lugar
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', maxWidth: '600px' }}>
            Alimentos nutritivos, juguetes divertidos y accesorios premium con la calidez y el cuidado que tus mejores amigos se merecen.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <Link to="/catalogo" className="btn btn-primary" style={{ gap: '8px' }}>
              <span>Ver Catálogo</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline">
              Registrar mi Mascota
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <Heart size={36} style={{ color: 'var(--color-accent)', margin: '0 auto 12px auto' }} />
            <h4 style={{ marginBottom: '8px' }}>Atención con Amor</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Pensamos siempre en la felicidad y el bienestar de tu compañero.</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <Shield size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 12px auto' }} />
            <h4 style={{ marginBottom: '8px' }}>Garantía de Calidad</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Productos cuidadosamente seleccionados por veterinarios expertos.</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <Award size={36} style={{ color: 'var(--color-accent)', margin: '0 auto 12px auto' }} />
            <h4 style={{ marginBottom: '8px' }}>Compras Seguras</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Pagos ágiles e integrados mediante PayPal Sandbox.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2rem' }}>Productos Destacados</h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>Echa un vistazo a nuestros favoritos de la semana</p>
          </div>
          <Link to="/catalogo" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
            <span>Ver todos</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-responsive">
          {featured.map(prod => (
            <div className="product-card" key={prod.id}>
              <img 
                src={prod.imagen ? `http://127.0.0.1:8000${prod.imagen}` : 'https://via.placeholder.com/300x200?text=Petshop'} 
                alt={prod.nombre} 
                className="product-image" 
              />
              <div className="product-info">
                <span className="product-category">{prod.categoria_detalle?.nombre || 'General'}</span>
                <h3 className="product-title">{prod.nombre}</h3>
                <p className="product-description">{prod.descripcion.substring(0, 80)}...</p>
                <div className="product-footer">
                  <span className="product-price">S/. {prod.precio}</span>
                  <Link to={`/producto/${prod.id}`} className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Ver Detalle
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
