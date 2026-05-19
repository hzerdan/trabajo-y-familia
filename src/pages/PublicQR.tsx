import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

const PublicQR: React.FC = () => {
  const [qrUrl, setQrUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://trabajo-y-familia.vercel.app';
    setQrUrl(`${baseUrl}/registro`);
  }, []);

  const handleRegisterRedirect = () => {
    navigate('/registro');
  };

  return (
    <div className="invitation-layout" style={{ minHeight: '100dvh', padding: '20px' }}>
      <div className="card invitation-card animate-fade-in" style={{ maxWidth: '440px', padding: '32px 24px', boxShadow: 'var(--shadow-premium)' }}>
        
        {/* Distintivo de evento */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px', 
          padding: '6px 14px', 
          backgroundColor: 'var(--primary-light)', 
          color: 'var(--primary)', 
          fontSize: '12px', 
          fontWeight: 600, 
          borderRadius: '50px', 
          marginBottom: '20px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px' 
        }}>
          <Sparkles size={12} />
          Charla Especial
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.2' }}>
          Familia y trabajo
        </h1>
        <p className="subtitle" style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '28px' }}>
          Escanea el código QR con tu celular para registrar tu asistencia al evento.
        </p>

        {/* Código QR */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#ffffff', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '260px',
          margin: '0 auto 28px auto'
        }}>
          {qrUrl && (
            <QRCodeSVG
              id="public-qr-code-svg"
              value={qrUrl}
              size={220}
              level="H"
              includeMargin={true}
            />
          )}
        </div>

        {/* Acciones para celular o link directo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleRegisterRedirect} 
            className="btn btn-primary btn-full"
            style={{ padding: '12px 18px', gap: '8px', fontWeight: 600, fontSize: '15px' }}
          >
            Registrarse en este dispositivo
            <ArrowRight size={16} />
          </button>
          
          <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px', wordBreak: 'break-all' }}>
            Enlace de registro directo: <a href={qrUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
              {qrUrl} <ExternalLink size={10} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicQR;
