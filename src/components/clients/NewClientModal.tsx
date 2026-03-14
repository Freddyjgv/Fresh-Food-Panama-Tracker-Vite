import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Hash, Mail, Phone, Globe, MapPin, 
  Loader2, Camera, Building2, CheckCircle2, Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { notify } from '@/components/AdminLayout';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewClientModal({ isOpen, onClose, onSuccess }: NewClientModalProps) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: '',
    tax_id: '',
    contact_name: '',
    contact_email: '',
    phone: '', // Corregido de contact_phone a phone
    address: '',
    country: '',
    logo_url: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setForm({
        name: '', tax_id: '', contact_name: '',
        contact_email: '', phone: '',
        address: '', country: '', logo_url: ''
      });
    }
  }, [isOpen]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      setForm(prev => ({ ...prev, logo_url: fileName }));
    } catch (error: any) {
      notify('Error al subir el logo: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    // VALIDACIÓN ESTRICTA según tu DB
    if (!form.name.trim()) return notify("El nombre es obligatorio", "error");
    if (!form.contact_email.trim()) return notify("El email de contacto es obligatorio para el portal", "error");

    setSaving(true);
    try {
      // Ajuste de Payload según tu esquema real de columnas
      const payload = {
        name: form.name.trim(),
        tax_id: form.tax_id.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim().toLowerCase(),
        phone: form.phone.trim() || null, // Nombre de columna real
        address: form.address.trim() || null,
        country: form.country.trim() || null,
        logo_url: form.logo_url || null,
        // Eliminamos created_at y status para que use los defaults de la DB
      };

      const { error } = await supabase
        .from('clients')
        .insert([payload]);

      if (error) throw error;

      notify("Cliente creado correctamente", "success");
      onSuccess?.();
      onClose();
    } catch (e: any) {
      console.error("Error de inserción:", e);
      notify(e.message || "Error al guardar el cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quote-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="quote-modal-card animate-in">
        <div className="modal-header">
          <div className="header-content">
            <span className="fresh-tag">Directorio de Partners</span>
            <h1>Nuevo Cliente</h1>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20}/></button>
        </div>

        <div className="modal-body">
          <div className="client-split-layout">
            <div className="logo-upload-container">
              <div className={`logo-preview-box ${form.logo_url ? 'has-image' : ''}`} onClick={() => !uploading && fileInputRef.current?.click()}>
                {form.logo_url ? (
                  <img src={`https://oqgkbduqztrpfhfclker.supabase.co/storage/v1/object/public/client-logos/${form.logo_url}`} alt="Preview" />
                ) : (
                  <div className="upload-placeholder">
                    {uploading ? <Loader2 className="animate-spin" size={24} /> : <Camera size={28} />}
                    <span>{uploading ? 'Subiendo...' : 'Logo'}</span>
                  </div>
                )}
                {form.logo_url && <div className="change-overlay"><Upload size={16} /></div>}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" hidden />
            </div>

            <div className="fields-stack">
              <div className="row-wrapper">
                <label className="row-subtitle">1. DATOS FISCALES</label>
                <div className="fields-row">
                  <div className="input-field flex-3">
                    <Building2 size={16} className="field-icon" />
                    <input placeholder="Nombre de la Empresa *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="input-field flex-2">
                    <Hash size={16} className="field-icon" />
                    <input placeholder="Tax ID / RUC" value={form.tax_id} onChange={e => setForm({...form, tax_id: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="row-wrapper">
                <label className="row-subtitle">2. CONTACTO PRINCIPAL</label>
                <div className="fields-row">
                  <div className="input-field flex-3">
                    <User size={16} className="field-icon" />
                    <input placeholder="Nombre de contacto" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} />
                  </div>
                  <div className="input-field flex-3">
                    <Mail size={16} className="field-icon" />
                    <input type="email" placeholder="Email corporativo *" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />
                  </div>
                </div>
                <div className="fields-row" style={{ marginTop: '-20px' }}>
                   <div className="input-field flex-3">
                      <Phone size={16} className="field-icon" />
                      <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                   </div>
                   <div className="flex-3"></div>
                </div>
              </div>

              <div className="row-wrapper">
                <label className="row-subtitle">3. UBICACIÓN</label>
                <div className="fields-row">
                  <div className="input-field flex-3">
                    <MapPin size={16} className="field-icon" />
                    <input placeholder="Dirección comercial" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                  <div className="input-field flex-2">
                    <Globe size={16} className="field-icon" />
                    <input placeholder="País" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary-save" onClick={handleCreate} disabled={saving || uploading || !form.name || !form.contact_email}>
            {saving ? <Loader2 className="animate-spin" /> : <>Guardar Cliente <CheckCircle2 size={18}/></>}
          </button>
        </div>
      </div>
      
      {/* Estilos CSS (Los mismos que ya tienes, no han cambiado) */}
      <style>{`
        .quote-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; }
        .quote-modal-card { background: white; width: 100%; max-width: 900px; border-radius: 32px; box-shadow: 0 40px 80px -15px rgba(0,0,0,0.3); overflow: hidden; }
        .modal-header { padding: 40px 45px 15px; display: flex; justify-content: space-between; align-items: flex-start; }
        .fresh-tag { color: #10b981; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; display: block; }
        .modal-header h1 { font-size: 30px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -1.2px; }
        .close-btn { background: #f8fafc; border: none; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .modal-body { padding: 15px 45px 45px; }
        .client-split-layout { display: grid; grid-template-columns: 160px 1fr; gap: 40px; }
        .fields-stack { display: flex; flex-direction: column; gap: 32px; }
        .fields-row { display: flex; gap: 12px; height: 58px; }
        .row-wrapper { display: flex; flex-direction: column; gap: 14px; position: relative; }
        .row-subtitle { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 0.8px; text-transform: uppercase; }
        .input-field { position: relative; display: flex; align-items: center; background: white; border: 1.5px solid #e2e8f0; border-radius: 16px; transition: 0.2s; }
        .input-field input { width: 100%; height: 100%; padding: 0 15px 0 45px; border: none; background: transparent; font-size: 14px; font-weight: 700; color: #1e293b; outline: none; }
        .field-icon { position: absolute; left: 16px; color: #94a3b8; pointer-events: none; z-index: 5; }
        .logo-preview-box { width: 140px; height: 140px; border-radius: 30px; border: 2.5px dashed #e2e8f0; background: #f8fafc; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; }
        .logo-preview-box img { width: 100%; height: 100%; object-fit: contain; padding: 15px; }
        .modal-footer { padding: 30px 45px 40px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 16px; }
        .btn-primary-save { background: #0f172a; color: white; border: none; padding: 14px 38px; border-radius: 16px; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .btn-secondary { padding: 14px 28px; border-radius: 16px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; color: #64748b; cursor: pointer; }
        .animate-in { animation: modalSpring 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalSpring { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .flex-3 { flex: 3; } .flex-2 { flex: 2; }
      `}</style>
    </div>
  );
}