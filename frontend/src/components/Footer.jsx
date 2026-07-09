import React from 'react';
import { PawPrint } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--color-primary)',
      color: '#FFFFFF',
      padding: '40px 0 20px 0',
      marginTop: '60px'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '30px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PawPrint size={24} style={{ fill: 'var(--color-accent)', color: 'var(--color-accent)' }} />
            <h3 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: '700' }}>Petshop</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', maxWidth: '400px' }}>
            Cuidamos a tus compañeros de vida ofreciéndoles la mejor alimentación, juguetes y accesorios de alta calidad.
          </p>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '15px', fontSize: '0.85rem', color: '#94A3B8' }}>
          <span>© 2026 Petshop. Todos los derechos reservados.</span>
          <span>Horario de atención: Lun a Sáb 8:00 AM - 8:00 PM (Hora de Lima)</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
