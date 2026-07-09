import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ShoppingCart, Info, Check } from 'lucide-react';
import productoService from '../services/productoService';
import { CarritoContext } from '../context/CarritoContext';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [especieFiltro, setEspecieFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedItem, setAddedItem] = useState(null); // Track last added item ID for subtle visual feedback
  const { agregarAlCarrito } = useContext(CarritoContext);

  useEffect(() => {
    setLoading(true);
    productoService.getProductos(especieFiltro)
      .then(data => {
        setProductos(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [especieFiltro]);

  const handleAgregar = (producto) => {
    agregarAlCarrito(producto, 1);
    setAddedItem(producto.id);
    setTimeout(() => {
      setAddedItem(null);
    }, 1500);
  };

  return (
    <div>
      <section style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Nuestro Catálogo</h1>
        <p style={{ color: 'var(--color-text-light)' }}>
          Encuentre los mejores productos compatibles con el cuidado e higiene de su fiel compañero.
        </p>
      </section>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setEspecieFiltro('')}
          className={`btn ${especieFiltro === '' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 20px', borderRadius: '999px', fontSize: '0.9rem' }}
        >
          <span>Todos los productos</span>
        </button>
        
        <button 
          onClick={() => setEspecieFiltro('perro')}
          className={`btn ${especieFiltro === 'perro' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 20px', borderRadius: '999px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PawPrint size={16} style={{ fill: especieFiltro === 'perro' ? '#FFFFFF' : 'var(--color-primary)' }} />
          <span>Para Perros</span>
        </button>
        
        <button 
          onClick={() => setEspecieFiltro('gato')}
          className={`btn ${especieFiltro === 'gato' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '8px 20px', borderRadius: '999px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <PawPrint size={16} style={{ fill: especieFiltro === 'gato' ? '#FFFFFF' : 'var(--color-primary)' }} />
          <span>Para Gatos</span>
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
          Cargando catálogo de productos...
        </div>
      ) : productos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ marginBottom: '8px' }}>No se encontraron productos</h3>
          <p style={{ color: 'var(--color-text-light)' }}>Intente cambiar el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="grid-responsive">
          {productos.map(prod => (
            <div className="product-card" key={prod.id}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={prod.imagen ? `http://127.0.0.1:8000${prod.imagen}` : 'https://via.placeholder.com/300x200?text=Petshop'} 
                  alt={prod.nombre} 
                  className="product-image" 
                />
                <span 
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase'
                  }}
                >
                  {prod.especie_compatible === 'ambos' ? 'Perro / Gato' : prod.especie_compatible}
                </span>
              </div>
              
              <div className="product-info">
                <span className="product-category">{prod.categoria_detalle?.nombre || 'General'}</span>
                <h3 className="product-title" style={{ fontSize: '1.1rem' }}>{prod.nombre}</h3>
                <p className="product-description" style={{ fontSize: '0.85rem' }}>
                  {prod.descripcion.substring(0, 100)}...
                </p>
                
                {/* Stock indicator */}
                <div style={{ marginBottom: '16px', fontSize: '0.8rem', fontWeight: '500' }}>
                  {prod.stock > 0 ? (
                    <span style={{ color: 'var(--color-success)' }}>Disponible ({prod.stock} unidades)</span>
                  ) : (
                    <span style={{ color: 'var(--color-danger)' }}>Sin stock disponible</span>
                  )}
                </div>

                <div className="product-footer">
                  <span className="product-price" style={{ fontSize: '1.2rem' }}>S/. {prod.precio}</span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link 
                      to={`/producto/${prod.id}`} 
                      className="btn btn-outline" 
                      style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
                      title="Ver detalle"
                    >
                      <Info size={16} />
                    </Link>
                    
                    <button 
                      onClick={() => handleAgregar(prod)}
                      disabled={prod.stock <= 0}
                      className={`btn ${addedItem === prod.id ? 'btn-primary' : 'btn-accent'}`}
                      style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', gap: '6px', fontSize: '0.85rem' }}
                    >
                      {addedItem === prod.id ? <Check size={16} /> : <ShoppingCart size={16} />}
                      <span>{addedItem === prod.id ? 'Añadido' : 'Comprar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogo;
