import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si el bypass de autenticación está activo (para desarrollo ágil)
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true' || localStorage.getItem('admin_bypass_session') === 'true';
    if (bypassAuth) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    // Verificar la sesión de Supabase Auth real
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
      } catch (err) {
        console.error('Error verificando la sesión:', err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!bypassAuth) {
        setAuthenticated(!!session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-muted)'
      }}>
        <div className="animate-fade-in">Cargando administrador...</div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirigir a login si no está autenticado
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
