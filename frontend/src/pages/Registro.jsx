import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, UserPlus } from 'lucide-react';
import authService from '../services/authService';

const Registro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(email, password, telefono || null);
      // Success: redirect to dashboard
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        // Collect field specific error messages
        const data = err.response.data;
        if (data.email) {
          setError(Array.isArray(data.email) ? data.email[0] : data.email);
        } else if (data.password) {
          setError(`Contraseña: ${Array.isArray(data.password) ? data.password[0] : data.password}`);
        } else if (data.non_field_errors) {
          setError(data.non_field_errors[0]);
        } else {
          setError('Error al registrar usuario. Verifique los datos.');
        }
      } else {
        setError('Error al registrar usuario. Inténtelo de nuevo.');
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
          <h2>Crear Cuenta</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>Regístrese para comprar y añadir a sus mascotas</p>
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
            <label className="form-label">Correo Electrónico *</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 4 caracteres"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Teléfono (Opcional)</label>
            <input 
              type="text" 
              className="form-control" 
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 987654321"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', gap: '8px' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Registrando...' : 'Registrarse'}</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span>¿Ya tiene una cuenta? </span>
          <Link to="/login" style={{ fontWeight: '600' }}>Inicie sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Registro;
