import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Registro from './pages/Registro';
import Login from './pages/Login';
import AdminAsistentes from './pages/AdminAsistentes';
import AdminQR from './pages/AdminQR';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para registro */}
        <Route path="/registro" element={<Registro />} />
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/registro" replace />} />
        
        {/* Ruta de Login para el administrador */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Rutas administrativas protegidas */}
        <Route 
          path="/admin/asistentes" 
          element={
            <ProtectedRoute>
              <AdminAsistentes />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/qr" 
          element={
            <ProtectedRoute>
              <AdminQR />
            </ProtectedRoute>
          } 
        />
        
        {/* Captura de rutas no encontradas (redirecciona al formulario público) */}
        <Route path="*" element={<Navigate to="/registro" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
