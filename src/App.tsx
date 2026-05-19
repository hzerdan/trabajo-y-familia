import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicQR from './pages/PublicQR';
import Registro from './pages/Registro';
import Login from './pages/Login';
import AdminAsistentes from './pages/AdminAsistentes';
import AdminQR from './pages/AdminQR';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial: Código QR público de la charla */}
        <Route path="/" element={<PublicQR />} />
        
        {/* Ruta pública para el formulario de registro */}
        <Route path="/registro" element={<Registro />} />
        
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
        
        {/* Captura de rutas no encontradas (redirecciona al QR principal) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
