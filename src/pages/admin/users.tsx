import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  Plus, X, Mail, Phone, Loader2, Search, 
  Building2, ShieldCheck, Upload, MapPin, Info,
  Pencil, ArrowRight
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { getApiBase } from "../../lib/apiBase";
import { AdminLayout, notify } from "../../components/AdminLayout";

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";

export default function AdminUsersPage() {
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState<'clients' | 'staff'>('clients');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initialForm = {
    id: null, 
    name: "", 
    legal_name: "", 
    tax_id: "", 
    contact_email: "", 
    phone: "", 
    country: "Panamá",
    mode: "invite" as "invite" | "manual",
    password: "",
    billing_info: { address: "", email: "", phone: "" },
    consignee_info: { address: "", email: "", phone: "" },
    notify_info: { address: "", email: "", phone: "" }
  };
  
  const [f, setF] = useState(initialForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const base = getApiBase();
      const endpoint = activeTab === 'clients' ? `${base}/.netlify/functions/listClients` : `${base}/.netlify/functions/listUsers`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      setDataList(data?.items || []);
    } catch (err: any) {
      if (typeof notify === 'function') notify(err.message || "Error", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredData = useMemo(() => {
    return dataList.filter(item => {
      const s = searchQuery.toLowerCase();
      const nameMatch = (item.name || item.full_name || "").toLowerCase().includes(s);
      const emailMatch = (item.contact_email || item.email || "").toLowerCase().includes(s);
      return nameMatch || emailMatch;
    });
  }, [dataList, searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${getApiBase()}/.netlify/functions/createClient`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(f)
      });
      if (res.ok) {
        notify("Operación exitosa", "success");
        setIsDrawerOpen(false);
        loadData();
      }
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout title="Directorio Maestro" subtitle="Control de identidades logísticas">
      <div className="ff-directory-container">
        <div className="directory-header">
          <div className="tabs">
            <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>
              Clientes <span className="tab-count">{activeTab === 'clients' ? filteredData.length : '0'}</span>
            </button>
            <button className={activeTab === 'staff' ? 'active' : ''} onClick={() => setActiveTab('staff')}>
              Staff Interno
            </button>
          </div>
          <div className="actions-bar">
            <div className="search-wrapper">
              <Search size={16} />
              <input placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="ff-btn-primary-top" onClick={() => { setF(initialForm); setIsDrawerOpen(true); }}>
              <Plus size={18} /> Nuevo
            </button>
          </div>
        </div>

        <div className="ff-table-wrapper">
          <table className="ff-table-top">
            <thead>
              <tr>
                <th>IDENTIDAD / TAX ID</th>
                <th>CONTACTO</th>
                <th>PAÍS / ROL</th>
                <th>ESTADO</th>
                <th style={{ textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin inline" /></td></tr>
              ) : filteredData.map(item => (
                <tr 
                  key={item.id || item.user_id} 
                  className="row-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/users/${item.id || item.user_id}`)}
                >
                  <td>
                    <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar-fallback" style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                        {getInitials(item.name || item.full_name)}
                      </div>
                      <div className="client-meta">
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.name || item.full_name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.tax_id || 'ID PERSONAL'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>
                      <div><Mail size={12} className="inline mr-1"/> {item.contact_email || item.email}</div>
                      <div style={{ color: '#94a3b8' }}><Phone size={12} className="inline mr-1"/> {item.phone || '—'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="country-tag">{activeTab === 'clients' ? (item.country || 'Panamá') : (item.role || 'Staff')}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${item.has_platform_access || item.confirmed_at ? 'active' : 'pending'}`}>
                      {item.has_platform_access || item.confirmed_at ? 'ACTIVO' : 'PROSPECTO'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ArrowRight size={16} style={{ color: '#cbd5e1' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div 
            className="ff-overlay" 
            onClick={() => setIsDrawerOpen(false)} 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} 
          />
          <div className="ff-drawer-pro" style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '480px', background: 'white', zIndex: 1000, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 900 }}>Nuevo Registro</h3>
              <button onClick={() => setIsDrawerOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: '30px', flex: 1 }}>
              <input className="ff-input-top" required placeholder="Nombre Comercial" value={f.name} onChange={e=>setF({...f, name:e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input className="ff-input-top" placeholder="Email de contacto" value={f.contact_email} onChange={e=>setF({...f, contact_email:e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <button type="submit" disabled={isSaving} style={{ width: '100%', padding: '15px', background: '#0f172a', color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: 'auto' }}>
                {isSaving ? "Guardando..." : "Crear Identidad"}
              </button>
            </form>
          </div>
        </>
      )}
    </AdminLayout>
  );
}