import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, PlusCircle, AlertCircle, ShoppingCart, User } from 'lucide-react';
import authService from '../services/authService';
import mascotaService from '../services/mascotaService';
import productoService from '../services/productoService';

const Dashboard = () => {
  const navigate = useNavigate(); // wait, make sure it is imported from react-router-dom!
  const user = authService.getCurrentUser();

  // Mascotas states
  const [mascotas, setMascotas] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  
  // Register pet form states
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('perro');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [razasDisponibles, setRazasDisponibles] = useState([]);
  const [loadingRazas, setLoadingRazas] = useState(false);
  const [submittingPet, setSubmittingPet] = useState(false);
  
  // Recommendations states
  const [recomendados, setRecomendados] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  
  const [error, setError] = useState('');

  // 1. Verify Authentication
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // 2. Fetch User Mascotas
  const fetchMascotas = async () => {
    setLoadingPets(true);
    try {
      const data = await mascotaService.getMascotas();
      setMascotas(data);
      
      // Trigger recommendations based on current user pets
      if (data.length > 0) {
        // If user has a dog, fetch dog-compatible items. If only cats, fetch cat-compatible. If both, fetch both.
        const hasDog = data.some(pet => pet.especie === 'perro');
        const hasCat = data.some(pet => pet.especie === 'gato');
        
        let targetEspecie = '';
        if (hasDog && !hasCat) targetEspecie = 'perro';
        else if (hasCat && !hasDog) targetEspecie = 'gato';
        // If they have both, we fetch general items or leave empty filter (shows all)
        
        fetchRecomendaciones(targetEspecie);
      } else {
        // No pets: fetch general recommendations (all products)
        fetchRecomendaciones('');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar sus mascotas.');
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchRecomendaciones = async (especieFiltro) => {
    setLoadingRecs(true);
    try {
      const data = await productoService.getProductos(especieFiltro);
      // Select first 4 items as recommendations
      setRecomendados(data.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMascotas();
    }
  }, []);

  // 3. Load Breeds dynamically based on species selection
  useEffect(() => {
    const fetchRazas = async () => {
      setLoadingRazas(true);
      try {
        const data = await mascotaService.getRazas(especie);
        setRazasDisponibles(data);
        if (data.length > 0) {
          setRaza(data[0].nombre); // Default to first breed
        }
      } catch (err) {
        console.error(err);
        setRazasDisponibles([]);
      } finally {
        setLoadingRazas(false);
      }
    };
    
    if (especie) {
      fetchRazas();
    }
  }, [especie]);

  // 4. Submit new Mascota
  const handleAddMascota = async (e) => {
    e.preventDefault();
    setError('');
    setSubmittingPet(true);

    const mascotaData = {
      nombre,
      especie,
      raza,
      edad: edad ? parseInt(edad) : null
    };

    try {
      await mascotaService.createMascota(mascotaData);
      // Reset form
      setNombre('');
      setEdad('');
      // Reload lists
      fetchMascotas();
    } catch (err) {
      console.error(err);
      setError('Error al registrar mascota. Verifique los datos.');
    } finally {
      setSubmittingPet(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      {/* Header Profile Section */}
      <section style={{
        backgroundColor: 'var(--color-white)',
        padding: '30px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-primary)',
          width: '60px',
          height: '60px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <User size={30} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Hola, {user.email}</h1>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
            {user.telefono ? `Teléfono: ${user.telefono}` : 'Sin teléfono registrado'}
          </p>
        </div>
      </section>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main dashboard columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="grid-responsive">
        {/* Left column: List and register pets */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Pets List */}
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '30px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '30px',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PawPrint size={20} style={{ fill: 'var(--color-primary)' }} />
              <span>Mis Mascotas</span>
            </h3>

            {loadingPets ? (
              <p>Cargando mascotas...</p>
            ) : mascotas.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                No tiene mascotas registradas. Regístrelas a la derecha para ver recomendaciones personalizadas.
              </p>
            ) : (
              <div className="table-container" style={{ boxShadow: 'none', margin: '0' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Especie</th>
                      <th>Raza</th>
                      <th>Edad (años)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mascotas.map(pet => (
                      <tr key={pet.id}>
                        <td style={{ fontWeight: '600' }}>{pet.nombre}</td>
                        <td style={{ textTransform: 'capitalize' }}>{pet.especie}</td>
                        <td>{pet.raza}</td>
                        <td>{pet.edad !== null ? pet.edad : 'No especificada'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recommendations Area */}
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '30px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} />
              <span>Recomendados para ti</span>
            </h3>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '20px' }}>
              {mascotas.length > 0 
                ? 'Productos filtrados automáticamente según el perfil de sus mascotas.'
                : 'Añada una mascota para recibir recomendaciones específicas.'}
            </p>

            {loadingRecs ? (
              <p>Cargando recomendaciones...</p>
            ) : recomendados.length === 0 ? (
              <p>No hay recomendaciones disponibles.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {recomendados.map(prod => (
                  <div className="product-card" key={prod.id} style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
                    <img 
                      src={prod.imagen ? prod.imagen : 'https://via.placeholder.com/200x130'} 
                      alt={prod.nombre} 
                      style={{ height: '130px', width: '100%', objectFit: 'cover' }}
                    />
                    <div className="product-info" style={{ padding: '12px' }}>
                      <span className="product-category" style={{ fontSize: '0.7rem' }}>{prod.categoria_detalle?.nombre}</span>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.nombre}
                      </h4>
                      <div className="product-footer" style={{ marginTop: '8px' }}>
                        <span className="product-price" style={{ fontSize: '1rem' }}>S/. {prod.precio}</span>
                        <Link to={`/producto/${prod.id}`} className="btn btn-accent" style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px' }}>
                          Ver
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Add pet form */}
        <div>
          <div style={{
            backgroundColor: 'var(--color-white)',
            padding: '30px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} />
              <span>Registrar Mascota</span>
            </h3>

            <form onSubmit={handleAddMascota}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Max"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Especie *</label>
                <select 
                  className="form-control" 
                  value={especie}
                  onChange={(e) => setEspecie(e.target.value)}
                >
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Raza (obtenida de API externa) *</label>
                <select 
                  className="form-control" 
                  required 
                  value={raza}
                  onChange={(e) => setRaza(e.target.value)}
                  disabled={loadingRazas}
                >
                  {loadingRazas ? (
                    <option>Cargando razas...</option>
                  ) : (
                    razasDisponibles.map(r => (
                      <option key={r.id} value={r.nombre}>{r.nombre}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Edad en años (opcional)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0"
                  max="30"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  placeholder="Ej. 3"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', gap: '8px' }}
                disabled={submittingPet || loadingRazas}
              >
                <PawPrint size={18} />
                <span>{submittingPet ? 'Registrando...' : 'Registrar'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
