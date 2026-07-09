import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { CarritoContext } from '../context/CarritoContext';
import authService from '../services/authService';
import pedidoService from '../services/pedidoService';
import pagoService from '../services/pagoService';

const Checkout = () => {
  const { carrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito, costoTotal } = useContext(CarritoContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pedidoCreado, setPedidoCreado] = useState(null);
  
  // Payment states
  const [paypalOrderId, setPaypalOrderId] = useState('');
  const [paypalLink, setPaypalLink] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(''); // 'creado', 'capturado', 'fallido'
  const [verifying, setVerifying] = useState(false);

  const isAuthenticated = authService.isAuthenticated();

  const handleConfirmarPedido = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    // Format details
    const detalles = carrito.map(item => ({
      producto_id: item.producto.id,
      cantidad: item.cantidad
    }));

    try {
      // 1. Create order in backend
      const pedido = await pedidoService.createPedido(detalles);
      setPedidoCreado(pedido);
      limpiarCarrito(); // Order created, clear current cart

      // 2. Automatically generate PayPal Sandbox order
      const pagoResponse = await pagoService.crearOrdenPaypal(pedido.id);
      setPaypalOrderId(pagoResponse.paypal_order_id);
      setPaymentStatus(pagoResponse.status);
      
      // Find approve link from PayPal response
      const approveLinkObj = pagoResponse.links?.find(link => link.rel === 'approve');
      if (approveLinkObj) {
        setPaypalLink(approveLinkObj.href);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detalles) {
        setError(err.response.data.detalles[0]);
      } else {
        setError('Error al procesar el pedido. Verifique el stock disponible.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarPago = async () => {
    setVerifying(true);
    setError('');
    try {
      const response = await pagoService.capturarPago(paypalOrderId);
      setPaymentStatus(response.pago_estado);
      if (response.pedido_estado === 'pagado') {
        // Success
        setPaymentStatus('capturado');
      }
    } catch (err) {
      console.error(err);
      setPaymentStatus('fallido');
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('El pago no pudo ser verificado o fue cancelado.');
      }
    } finally {
      setVerifying(false);
    }
  };

  // 1. Unauthenticated Prompt
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        <ShoppingBag size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 16px auto' }} />
        <h2 style={{ marginBottom: '12px' }}>Inicie sesión para continuar</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
          Debe ingresar con su cuenta para confirmar el pedido y proceder con el pago seguro.
        </p>
        <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
      </div>
    );
  }

  // 2. Successful Payment View
  if (paymentStatus === 'capturado') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        <CheckCircle size={60} style={{ color: 'var(--color-success)', margin: '0 auto 16px auto' }} />
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '12px' }}>¡Pago Completado!</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px auto' }}>
          Tu pago ha sido capturado correctamente en PayPal Sandbox. El pedido #{pedidoCreado?.id} se encuentra ahora en estado <strong>PAGADO</strong>.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn btn-primary">Ir a mi Panel</Link>
          <Link to="/catalogo" className="btn btn-outline">Seguir Comprando</Link>
        </div>
      </div>
    );
  }

  // 3. Payment Pending view (PayPal Button display)
  if (pedidoCreado) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--color-white)', padding: '40px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Pedido Confirmado (# {pedidoCreado.id})</h2>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Monto total a pagar: S/. {pedidoCreado.total}</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <h4 style={{ marginBottom: '8px' }}>Instrucciones de Pago</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', marginBottom: '16px' }}>
              Haga clic en el botón de abajo para abrir la ventana de PayPal Sandbox y autorizar la transacción de prueba.
            </p>
            {paypalLink ? (
              <a 
                href={paypalLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-accent" 
                style={{ width: '100%', gap: '8px', textDecoration: 'none' }}
              >
                <span>Proceder al pago en PayPal</span>
                <ExternalLink size={16} />
              </a>
            ) : (
              <div style={{ color: 'var(--color-danger)' }}>No se pudo generar el enlace de aprobación de PayPal.</div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
              ¿Ya completaste la transacción en la pestaña de PayPal?
            </p>
            <button 
              onClick={handleVerificarPago} 
              disabled={verifying}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {verifying ? 'Verificando...' : 'Verificar e Confirmar Pago'}
            </button>
            {paymentStatus === 'fallido' && (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '8px' }}>
                La captura falló o el pago fue rechazado. El stock se ha liberado y el pedido está pendiente. Puede volver a intentar pagar.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Cart Empty View
  if (carrito.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        <ShoppingBag size={48} style={{ color: 'var(--color-accent)', margin: '0 auto 16px auto' }} />
        <h2 style={{ marginBottom: '8px' }}>Tu carrito está vacío</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>
          Agregue algunos productos desde el catálogo para iniciar una compra.
        </p>
        <Link to="/catalogo" className="btn btn-primary">Ir al Catálogo</Link>
      </div>
    );
  }

  // 5. Standard Cart Checkout View
  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Carrito de Compras</h1>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="grid-responsive">
        {/* Cart items list */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map(item => (
                  <tr key={item.producto.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={item.producto.imagen ? `http://127.0.0.1:8000${item.producto.imagen}` : 'https://via.placeholder.com/60x60'} 
                          alt={item.producto.nombre} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <span style={{ fontWeight: '500' }}>{item.producto.nombre}</span>
                      </div>
                    </td>
                    <td>S/. {item.producto.precio}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                        >
                          -
                        </button>
                        <span>{item.cantidad}</span>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>S/. {(item.cantidad * parseFloat(item.producto.precio)).toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => eliminarDelCarrito(item.producto.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                        title="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart summary */}
        <div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '30px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>Resumen</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Productos:</span>
              <span style={{ fontWeight: '500' }}>{carrito.reduce((sum, item) => sum + item.cantidad, 0)} unidades</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              <span>Total:</span>
              <span>S/. {costoTotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleConfirmarPedido}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', gap: '8px' }}
            >
              <span>{loading ? 'Confirmando...' : 'Confirmar Pedido'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
