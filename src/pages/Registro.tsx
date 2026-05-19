import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Phone, User, Users, MessageSquare, Heart, CheckCircle, AlertCircle } from 'lucide-react';

const Registro: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [phone, setPhone] = useState('');
  const [companionPhone, setCompanionPhone] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const [observations, setObservations] = useState('');

  // Estados de carga y feedback de usuario
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estados de error de validación
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre y apellido es obligatorio.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'El teléfono celular es obligatorio.';
    } else {
      // Validar que el teléfono tenga al menos 6 dígitos numéricos
      const digitCount = phone.replace(/[^0-9]/g, '').length;
      if (digitCount < 6) {
        newErrors.phone = 'Introduce un número de teléfono celular válido.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([
          {
            full_name: fullName.trim(),
            companion_full_name: companionName.trim() || null,
            phone: phone.trim(),
            companion_phone: companionPhone.trim() || null,
            invited_by: invitedBy.trim() || null,
            observations: observations.trim() || null,
            event_title: 'Familia y trabajo'
          }
        ]);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      clearForm();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ocurrió un problema al enviar tu registro. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFullName('');
    setCompanionName('');
    setPhone('');
    setCompanionPhone('');
    setInvitedBy('');
    setObservations('');
    setErrors({});
  };

  const handleReset = () => {
    setSuccess(false);
    setErrorMsg(null);
  };

  return (
    <div className="invitation-layout">
      <div className="card invitation-card animate-fade-in">
        <div className="event-badge">
          <Calendar size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Charla Presencial
        </div>
        
        <h1>Familia y trabajo</h1>
        <p className="subtitle">Registro de asistentes a la charla</p>

        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle className="alert-icon" size={18} />
            <div>{errorMsg}</div>
          </div>
        )}

        {success ? (
          <div className="success-state animate-fade-in">
            <div className="success-icon-container">
              <CheckCircle size={32} />
            </div>
            <h2>¡Registro Exitoso!</h2>
            <p>Gracias, tu registro fue cargado correctamente.</p>
            <button onClick={handleReset} className="btn btn-primary btn-full">
              Cargar otra persona
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Nombre y apellido <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Ej. Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
              {errors.fullName && <span className="form-error-msg">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Teléfono celular <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="phone"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Ej. +54 9 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
              {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
            </div>

            <hr style={{ border: '0', height: '1px', background: 'var(--border)', margin: '24px 0' }} />

            <div className="form-group">
              <label className="form-label" htmlFor="companionName">
                Nombre y apellido del acompañante <span>(Opcional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="companionName"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Ej. María López"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  disabled={loading}
                />
                <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="companionPhone">
                Teléfono celular del acompañante <span>(Opcional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="companionPhone"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Ej. +54 9 11 9876-5432"
                  value={companionPhone}
                  onChange={(e) => setCompanionPhone(e.target.value)}
                  disabled={loading}
                />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
            </div>

            <hr style={{ border: '0', height: '1px', background: 'var(--border)', margin: '24px 0' }} />

            <div className="form-group">
              <label className="form-label" htmlFor="invitedBy">
                ¿Quién lo/la invitó? <span>(Opcional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="invitedBy"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Ej. Nombre del amigo o institución"
                  value={invitedBy}
                  onChange={(e) => setInvitedBy(e.target.value)}
                  disabled={loading}
                />
                <Heart size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="observations">
                Observaciones o comentarios <span>(Opcional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  id="observations"
                  className="form-textarea"
                  style={{ paddingLeft: '38px', paddingTop: '10px' }}
                  placeholder="Cualquier aclaración que consideres importante..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
                <MessageSquare size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-light)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Enviando registro...' : 'Confirmar Asistencia'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Registro;
