import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabaseClient';
import { QrCode, ClipboardList, LogOut, Printer, Download, ExternalLink, AlertCircle } from 'lucide-react';

const AdminQR: React.FC = () => {
  const [qrUrl, setQrUrl] = useState('');
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener la URL base desde la variable de entorno
    const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
    
    if (baseUrl) {
      setQrUrl(`${baseUrl}/registro`);
      setIsEnvConfigured(true);
    } else {
      // Fallback dinámico si no está configurada
      setQrUrl(`${window.location.origin}/registro`);
      setIsEnvConfigured(false);
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('admin_bypass_session');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    navigate('/admin/login');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('qr-code-svg');
    if (!svgElement) return;

    // Serializar el elemento SVG a string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'qr_registro_familia_y_trabajo.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="admin-layout">
      {/* Navbar Superior */}
      <header className="admin-header no-print">
        <div className="container admin-nav">
          <div className="admin-nav-logo">
            <ClipboardList size={22} style={{ color: 'var(--primary)' }} />
            <span>Charla: Familia y Trabajo</span>
          </div>
          <nav className="admin-nav-links">
            <Link to="/admin/asistentes" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
              Asistentes
            </Link>
            <Link to="/admin/qr" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', gap: '4px', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              <QrCode size={14} />
              Ver QR
            </Link>
            <a href="/registro" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
              Ver Registro Público
            </a>
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '13px', gap: '4px' }}>
              <LogOut size={14} />
              Salir
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="admin-content">
        <div className="container">
          
          {/* Hojas de estilo específicas para la impresión limpia del código QR */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
                background: white !important;
              }
              .print-section, .print-section * {
                visibility: visible;
              }
              .print-section {
                position: absolute;
                left: 50%;
                top: 20%;
                transform: translate(-50%, 0);
                width: 100%;
                max-width: 100% !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div className="no-print animate-fade-in" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <h2 className="card-title">Código QR de Registro</h2>
            <p className="card-subtitle">
              Muestra este código para que las personas escaneen y se registren desde su celular.
            </p>
          </div>

          {!isEnvConfigured && (
            <div className="alert alert-error no-print animate-fade-in" style={{ maxWidth: '480px', margin: '0 auto 24px auto', textAlign: 'left' }}>
              <AlertCircle className="alert-icon" size={20} />
              <div>
                <strong>Configuración requerida:</strong> La variable <code>VITE_PUBLIC_SITE_URL</code> no está en el <code>.env</code>.
                Se usa temporalmente el origen actual del navegador: <code>{window.location.origin}</code>.
              </div>
            </div>
          )}

          {/* Tarjeta del Código QR */}
          <div className="qr-card-container print-section animate-fade-in">
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Charla: “Familia y trabajo”</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>Escanea para registrar tu asistencia</p>
            </div>

            <div className="qr-box">
              {qrUrl && (
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrUrl}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>

            <div className="qr-url-display no-print">
              <span>Enlace:</span>
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {qrUrl}
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="qr-actions-container no-print">
              <button onClick={handlePrint} className="btn btn-primary btn-full" style={{ gap: '8px' }}>
                <Printer size={16} />
                Imprimir Código QR
              </button>
              <button onClick={handleDownloadQR} className="btn btn-secondary btn-full" style={{ gap: '8px' }}>
                <Download size={16} />
                Descargar SVG (Alta Calidad)
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminQR;
