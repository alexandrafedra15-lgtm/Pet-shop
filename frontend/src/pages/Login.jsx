import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, LogIn } from 'lucide-react';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      // Success: redirect to dashboard
      navigate('/dashboard');
      // Reload page to update navbar state
      window.location.reload();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al iniciar sesión. Verifique sus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '40px 0' }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        padding: '40px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', textAlign: 'center' }}>
          <PawPrint size={40} style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)', marginBottom: '12px' }} />
          <h2>Ingresar a Petshop</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>Inicie sesión para gestionar su carrito y mascotas</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', gap: '8px' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Cargando...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span>¿No tiene una cuenta? </span>
          <Link to="/registro" style={{ fontWeight: '600' }}>Regístrese aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
