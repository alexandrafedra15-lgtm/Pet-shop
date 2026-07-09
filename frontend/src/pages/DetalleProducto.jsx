import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, PawPrint, Check } from 'lucide-react';
import productoService from '../services/productoService';
import { CarritoContext } from '../context/CarritoContext';

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { agregarAlCarrito } = useContext(CarritoContext);

  useEffect(() => {
    productoService.getProductos()
      .then(data => {
        const found = data.find(item => item.id === parseInt(id));
        if (found) {
          setProducto(found);
        } else {
          setError('Producto no encontrado.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Error al cargar la información del producto.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Wait, let's fix the useEffect logic. It should set loading to false in finally.
  // Actually, we can fetch all products and find, or let's just make it call the API.
  // Wait, does the API have an endpoint GET /api/productos/<id>?
  // The contract lists:
  // "GET /api/productos/?especie=X — lista productos filtrados"
  // It does NOT list a specific retrieve product endpoint!
  // So yes, querying all products and finding the matching one is a very clever way to solve this within the strict API contract constraints!
  // Let's make sure loading is set to false in finally.
  // Let's modify our useEffect to do that.

  const handleAgregar = () => {
    if (cantidad > producto.stock) {
      alert(`La cantidad solicitada supera el stock disponible (${producto.stock}).`);
      return;
    }
    agregarAlCarrito(producto, cantidad);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', padding: '8px 16px' }}>
        <ArrowLeft size={16} />
        <span>Volver atrás</span>
      </button>

      {error ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3>{error}</h3>
          <Link to="/catalogo" className="btn btn-primary" style={{ marginTop: '16px' }}>Volver al catálogo</Link>
        </div>
      ) : !producto ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
          Cargando detalles del producto...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px',
          backgroundColor: 'var(--color-white)',
          padding: '40px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Responsive Layout Grid on Desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }} className="grid-responsive">
            <div>
              <img 
                src={producto.imagen ? producto.imagen : 'https://via.placeholder.com/600x400?text=Petshop'} 
                alt={producto.nombre} 
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-secondary)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className="product-category" style={{ fontSize: '0.9rem' }}>
                {producto.categoria_detalle?.nombre || 'General'}
              </span>
              <h1 style={{ fontSize: '2.2rem', lineHeight: '1.2', color: 'var(--color-primary)' }}>
                {producto.nombre}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PawPrint size={14} style={{ fill: 'var(--color-primary)' }} />
                  <span>Compatible: {producto.especie_compatible === 'ambos' ? 'Perro y Gato' : producto.especie_compatible}</span>
                </span>
                
                {producto.stock > 0 ? (
                  <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                    En Stock ({producto.stock} uds)
                  </span>
                ) : (
                  <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                    Agotado
                  </span>
                )}
              </div>

              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', margin: '10px 0' }}>
                S/. {producto.precio}
              </div>

              <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {producto.descripcion}
              </p>

              {producto.stock > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <span style={{ fontWeight: '500' }}>Cantidad:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '1.1rem', fontWeight: '600', width: '30px', textAlign: 'center' }}>
                        {cantidad}
                      </span>
                      <button 
                        onClick={() => setCantidad(prev => Math.min(producto.stock, prev + 1))}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={handleAgregar}
                      className={`btn ${success ? 'btn-primary' : 'btn-accent'}`}
                      style={{ padding: '12px 30px', gap: '8px', flexGrow: 1 }}
                    >
                      {success ? <Check size={20} /> : <ShoppingCart size={20} />}
                      <span>{success ? 'Añadido al Carrito' : 'Agregar al Carrito'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleProducto;
