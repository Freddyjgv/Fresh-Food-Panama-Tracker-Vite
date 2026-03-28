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
    phone: '',
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
    if (!form.name.trim()) return notify("El nombre es obligatorio", "error");
    if (!form.contact_email.trim()) return notify("El email es necesario para futuras cotizaciones", "error");

    setSaving(true);
    try {
      // FLUJO CONTROLADO: Solo insertamos en la tabla de base de datos.
      // No se invoca ninguna función de Auth.
      const payload = {
        name: form.name.trim(),
        tax_id: form.tax_id.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        country: form.country.trim() || null,
        logo_url: form.logo_url || null,
        has_platform_access: false, // IMPORTANTE: El acceso inicia desactivado
        status: 'active'
      };

      const { error } = await supabase
        .from('clients')
        .insert([payload]);

      if (error) throw error;

      notify("Cliente registrado en el directorio", "success");
      onSuccess?.();
      onClose();
    } catch (e: any) {
      console.error("Error de registro:", e);
      notify(e.message || "Error al guardar el cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quote-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="quote-modal-card animate-in">
        {/* Header y Body se mantienen igual para mantener consistencia de UI */}
        <div className="modal-header">
          <div className="header-content">
            <span className="fresh-tag">Directorio de Partners</span>
            <h1>Nuevo Cliente</h1>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20}/></button>
        </div>

        <div className="modal-body">
          <div className="client-split-layout">
            {/* ... Sección de Logo ... */}
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
              {/* Sección 1: Datos Fiscales */}
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

              {/* Sección 2: Contacto (No genera usuario todavía) */}
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
              </div>

              {/* Sección 3: Ubicación */}
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
            {saving ? <Loader2 className="animate-spin" /> : <>Guardar en Directorio <CheckCircle2 size={18}/></>}
          </button>
        </div>
      </div>
      
      <style>{`
        /* Estilos omitidos por brevedad, se mantienen los originales */
      `}</style>
    </div>
  );
}