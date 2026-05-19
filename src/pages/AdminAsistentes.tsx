import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  Users, Search, Download, Edit, Trash2, LogOut, 
  QrCode, ClipboardList, X, Save, AlertTriangle, UserCheck
} from 'lucide-react';

interface Registration {
  id: string;
  full_name: string;
  companion_full_name: string | null;
  phone: string;
  companion_phone: string | null;
  invited_by: string | null;
  observations: string | null;
  event_title: string;
  created_at: string;
}

const AdminAsistentes: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegs, setFilteredRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mensaje de error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Estado para el modal de edición
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editCompanionName, setEditCompanionName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompanionPhone, setEditCompanionPhone] = useState('');
  const [editInvitedBy, setEditInvitedBy] = useState('');
  const [editObservations, setEditObservations] = useState('');
  const [editErrors, setEditErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);

  // Estado para el modal de eliminación
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  // Obtener registros de Supabase
  const fetchRegistrations = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
      setFilteredRegs(data || []);
    } catch (err: any) {
      console.error('Error cargando asistentes:', err);
      setErrorMsg('Error al conectar con la base de datos de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Búsqueda en tiempo real
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredRegs(registrations);
      return;
    }

    const filtered = registrations.filter(r => {
      const nameMatch = r.full_name?.toLowerCase().includes(q);
      const companionMatch = r.companion_full_name?.toLowerCase().includes(q);
      const phoneMatch = r.phone?.includes(q) || r.companion_phone?.includes(q);
      const inviteMatch = r.invited_by?.toLowerCase().includes(q);
      return nameMatch || companionMatch || phoneMatch || inviteMatch;
    });

    setFilteredRegs(filtered);
  }, [searchQuery, registrations]);

  // Totales
  const totalRegistrations = registrations.length;
  const totalEstimatedAttendees = registrations.reduce((acc, current) => {
    // Suma 2 si hay acompañante, de lo contrario 1
    const companionValid = current.companion_full_name && current.companion_full_name.trim() !== '';
    return acc + (companionValid ? 2 : 1);
  }, 0);

  // Cerrar sesión
  const handleLogout = async () => {
    localStorage.removeItem('admin_bypass_session');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    navigate('/admin/login');
  };

  // Abrir Modal Edición
  const startEdit = (reg: Registration) => {
    setEditingReg(reg);
    setEditFullName(reg.full_name || '');
    setEditCompanionName(reg.companion_full_name || '');
    setEditPhone(reg.phone || '');
    setEditCompanionPhone(reg.companion_phone || '');
    setEditInvitedBy(reg.invited_by || '');
    setEditObservations(reg.observations || '');
    setEditErrors({});
  };

  // Guardar Cambios del Modal
  const saveEdit = async () => {
    if (!editingReg) return;
    setEditErrors({});

    const newErrors: { fullName?: string; phone?: string } = {};
    if (!editFullName.trim()) newErrors.fullName = 'El nombre y apellido es obligatorio.';
    if (!editPhone.trim()) newErrors.phone = 'El teléfono es obligatorio.';

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          full_name: editFullName.trim(),
          companion_full_name: editCompanionName.trim() || null,
          phone: editPhone.trim(),
          companion_phone: editCompanionPhone.trim() || null,
          invited_by: editInvitedBy.trim() || null,
          observations: editObservations.trim() || null,
        })
        .eq('id', editingReg.id);

      if (error) throw error;

      // Actualizar tabla local
      setRegistrations(prev => prev.map(r => r.id === editingReg.id ? {
        ...r,
        full_name: editFullName.trim(),
        companion_full_name: editCompanionName.trim() || null,
        phone: editPhone.trim(),
        companion_phone: editCompanionPhone.trim() || null,
        invited_by: editInvitedBy.trim() || null,
        observations: editObservations.trim() || null,
      } : r));

      setEditingReg(null);
    } catch (err: any) {
      console.error('Error al guardar edición:', err);
      alert('Error: No se pudieron guardar los cambios en Supabase.');
    } finally {
      setSaving(false);
    }
  };

  // Confirmar eliminación
  const confirmDelete = (id: string, name: string) => {
    setDeletingId(id);
    setDeletingName(name);
  };

  // Eliminar de base de datos
  const executeDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', deletingId);

      if (error) throw error;

      setRegistrations(prev => prev.filter(r => r.id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      console.error('Error eliminando asistente:', err);
      alert('Error: No se pudo eliminar el registro.');
    } finally {
      setDeleting(false);
    }
  };

  // Exportar a CSV con BOM UTF-8 (soporte para acentos en Excel)
  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      'Fecha Registro',
      'Asistente Principal',
      'Telefono Celular',
      'Nombre Acompanante',
      'Telefono Acompanante',
      'Invitado Por',
      'Observaciones'
    ];

    const rows = registrations.map(r => [
      new Date(r.created_at).toLocaleDateString('es-AR') + ' ' + new Date(r.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      r.full_name,
      r.phone,
      r.companion_full_name || '',
      r.companion_phone || '',
      r.invited_by || '',
      (r.observations || '').replace(/\r?\n|\r/g, ' ') // Quitar saltos de línea para no dañar el CSV
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `asistentes_charla_familia_y_trabajo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-layout animate-fade-in">
      {/* Navbar Superior */}
      <header className="admin-header">
        <div className="container admin-nav">
          <div className="admin-nav-logo">
            <ClipboardList size={22} style={{ color: 'var(--primary)' }} />
            <span>Charla: Familia y Trabajo</span>
          </div>
          <nav className="admin-nav-links">
            <Link to="/admin/asistentes" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              Asistentes
            </Link>
            <Link to="/admin/qr" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', gap: '4px' }}>
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

      {/* Panel Administrativo */}
      <main className="admin-content">
        <div className="container">
          
          {/* Contadores */}
          <div className="stats-container animate-fade-in">
            <div className="stat-card">
              <div className="stat-icon">
                <ClipboardList size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Registros Cargados</span>
                <span className="stat-value">{totalRegistrations}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                <Users size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Estimado de Asistentes</span>
                <span className="stat-value">{totalEstimatedAttendees}</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="alert alert-error animate-fade-in">
              <AlertTriangle className="alert-icon" size={18} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Filtros e Inputs de Acción */}
          <div className="admin-actions">
            <div className="search-wrapper">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre, teléfono o invitador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="action-buttons">
              <button 
                onClick={exportToCSV} 
                className="btn btn-secondary" 
                style={{ gap: '6px' }}
                disabled={registrations.length === 0}
              >
                <Download size={16} />
                Exportar CSV
              </button>
              <button onClick={fetchRegistrations} className="btn btn-secondary">
                Actualizar
              </button>
            </div>
          </div>

          {/* Tabla de Resultados */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-light)' }}>
              Obteniendo listado de asistentes desde Supabase...
            </div>
          ) : filteredRegs.length === 0 ? (
            <div className="card no-data-state">
              <UserCheck size={32} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <h3>Sin registros encontrados</h3>
              <p>{searchQuery ? 'Prueba refinando la búsqueda o con otros términos.' : 'Nadie se ha registrado todavía para la charla.'}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha de Registro</th>
                    <th>Asistente Principal</th>
                    <th>Teléfono</th>
                    <th>Acompañante</th>
                    <th>Tel. Acompañante</th>
                    <th>Invitado por</th>
                    <th>Observaciones</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.map((reg) => (
                    <tr key={reg.id}>
                      <td data-label="Fecha">{formatDate(reg.created_at)}</td>
                      <td data-label="Nombre" style={{ fontWeight: 600 }}>{reg.full_name}</td>
                      <td data-label="Teléfono">{reg.phone}</td>
                      <td data-label="Acompañante">{reg.companion_full_name || <span style={{ color: 'var(--text-light)' }}>-</span>}</td>
                      <td data-label="Tel. Acomp.">{reg.companion_phone || <span style={{ color: 'var(--text-light)' }}>-</span>}</td>
                      <td data-label="Invitado por">{reg.invited_by || <span style={{ color: 'var(--text-light)' }}>-</span>}</td>
                      <td data-label="Observaciones" style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={reg.observations || ''}>
                        {reg.observations || <span style={{ color: 'var(--text-light)' }}>-</span>}
                      </td>
                      <td className="row-actions-cell" style={{ textAlign: 'right' }}>
                        <div className="row-actions">
                          <button onClick={() => startEdit(reg)} className="row-action-btn" title="Editar">
                            <Edit size={15} />
                          </button>
                          <button onClick={() => confirmDelete(reg.id, reg.full_name)} className="row-action-btn btn-delete-action" title="Eliminar">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Modal para Editar Asistente */}
      {editingReg && (
        <div className="modal-backdrop">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Editar Asistente</h3>
              <button onClick={() => setEditingReg(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="editFullName">Nombre y apellido *</label>
                <input
                  id="editFullName"
                  type="text"
                  className="form-input"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                />
                {editErrors.fullName && <span className="form-error-msg">{editErrors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editPhone">Teléfono celular *</label>
                <input
                  id="editPhone"
                  type="text"
                  className="form-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
                {editErrors.phone && <span className="form-error-msg">{editErrors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editCompanionName">Acompañante <span>(Opcional)</span></label>
                <input
                  id="editCompanionName"
                  type="text"
                  className="form-input"
                  value={editCompanionName}
                  onChange={(e) => setEditCompanionName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editCompanionPhone">Teléfono del acompañante <span>(Opcional)</span></label>
                <input
                  id="editCompanionPhone"
                  type="text"
                  className="form-input"
                  value={editCompanionPhone}
                  onChange={(e) => setEditCompanionPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editInvitedBy">¿Quién invitó? <span>(Opcional)</span></label>
                <input
                  id="editInvitedBy"
                  type="text"
                  className="form-input"
                  value={editInvitedBy}
                  onChange={(e) => setEditInvitedBy(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editObservations">Observaciones <span>(Opcional)</span></label>
                <textarea
                  id="editObservations"
                  className="form-textarea"
                  value={editObservations}
                  onChange={(e) => setEditObservations(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditingReg(null)} className="btn btn-secondary" disabled={saving}>
                Cancelar
              </button>
              <button onClick={saveEdit} className="btn btn-primary" style={{ gap: '6px' }} disabled={saving}>
                {saving ? 'Guardando...' : (
                  <>
                    <Save size={16} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Confirmación de Eliminación */}
      {deletingId && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm animate-fade-in">
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
                <AlertTriangle size={20} />
                <h3 className="modal-title" style={{ color: 'var(--text-main)' }}>¿Eliminar asistente?</h3>
              </div>
              <button onClick={() => setDeletingId(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingBottom: '10px' }}>
              <p>Vas a eliminar el registro de <strong>{deletingName}</strong> de la base de datos.</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Esta acción es irreversible y afectará los totales de asistencia.</p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', backgroundColor: 'transparent' }}>
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary" disabled={deleting}>
                Cancelar
              </button>
              <button onClick={executeDelete} className="btn btn-danger" style={{ backgroundColor: 'var(--error)', color: 'white' }} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Eliminar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAsistentes;
