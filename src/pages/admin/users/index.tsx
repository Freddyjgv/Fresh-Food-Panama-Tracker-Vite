import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { AdminLayout, notify } from '@/components/AdminLayout';
import { 
  Plus, Calculator, KeyRound, Mail, Loader2, 
  ChevronRight, Search, X, Users, Globe, ShieldCheck, SortAsc
} from 'lucide-react';

// MODALES
import { QuickQuoteModal } from '@/components/quotes/QuickQuoteModal';
import { NewClientModal } from '@/components/clients/NewClientModal';

// Ayudante para banderas
const getFlag = (country: string) => {
  const flags: Record<string, string> = {
    'Panamá': '🇵🇦', 'España': '🇪🇸', 'Colombia': '🇨🇴', 'USA': '🇺🇸', 
    'Ecuador': '🇪🇨', 'Costa Rica': '🇨🇷', 'Chile': '🇨🇱', 'México': '🇲🇽'
  };
  return flags[country] || '🌐';
};

// --- COMPONENTE SKELETON PARA CLIENTES (Mantenido igual) ---
const ClientSkeleton = () => (
  <div className="quote-row-item skeleton-row">
    <div className="col-ident">
      <div className="client-profile-box">
        <div className="skel-avatar"></div>
        <div className="name-stack" style={{ flex: 1 }}>
          <div className="skel-line w70"></div>
          <div className="skel-line w40"></div>
        </div>
      </div>
    </div>
    <div className="col-client">
      <div className="skel-pill w80" style={{ height: '28px' }}></div>
    </div>
    <div className="col-route">
      <div className="skel-line w60"></div>
    </div>
    <div className="col-amount">
      <div className="skel-pill w50"></div>
    </div>
    <div className="col-status">
      <div className="skel-line w40" style={{ marginRight: '20px' }}></div>
      <div className="skel-line w10" style={{ height: '20px' }}></div>
    </div>
  </div>
);

export default function ClientsIndex() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  // ESTADOS PARA MODALES
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, [dir]);

  async function fetchClients() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: dir === 'asc' });
      if (error) throw error;
      setClients(data || []);
    } catch (e) {
      notify("Error al cargar clientes", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleResetPassword = async (email: string) => {
    if (!email) return notify("El cliente no tiene email registrado", "error");
    const confirmar = window.confirm(`¿Enviar correo oficial de restablecimiento de contraseña a ${email}?`);
    if (!confirmar) return;
    
    try {
      notify("Conectando con Supabase Auth...", "success");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) throw error;
      notify("Correo de Supabase enviado a " + email, "success");
    } catch (e: any) {
      notify(e.message || "No se pudo enviar el reset", "error");
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name?.toLowerCase().includes(q.toLowerCase()) || 
      c.tax_id?.toLowerCase().includes(q.toLowerCase()) ||
      c.contact_email?.toLowerCase().includes(q.toLowerCase())
    );
  }, [clients, q]);

  return (
    <AdminLayout title="Directorio de Clientes">
      <div className="quotes-page-wrapper">
        
        {/* HEADER - USANDO TU CLASE btn-main-action */}
        <div className="header-section">
          <div className="title-group">
            <h1>Gestión de Clientes</h1>
            <p>Cuentas maestras, perfiles fiscales y accesos al portal.</p>
          </div>
          <button className="btn-main-action" onClick={() => setIsNewClientModalOpen(true)}>
            <Plus size={20} strokeWidth={2} />
            Nuevo Cliente
          </button>
        </div>

        {/* METRICS DASHBOARD (Mantenido igual) */}
        <div className="stats-dashboard">
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Total Clientes</span>
              <span className="value">{clients.length}</span>
            </div>
            <div className="metric-icon blue"><Users size={24} /></div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Mercados</span>
              <span className="value">{new Set(clients.map(c => c.country)).size}</span>
            </div>
            <div className="metric-icon green"><Globe size={24} /></div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Acceso Activo</span>
              <span className="value">{clients.filter(c => c.contact_email).length}</span>
            </div>
            <div className="metric-icon slate"><ShieldCheck size={24} /></div>
          </div>
        </div>

        {/* FILTERS BAR (Mantenido igual) */}
        <div className="filters-bar">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              placeholder="Buscar por nombre, RUC o email..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
            />
            {q && <X size={16} className="clear-search" onClick={() => setQ("")} />}
          </div>

          <button className="sort-toggle" onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>
            <SortAsc size={16} /> {dir === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        {/* LISTADO UNIFICADO (Mantenido igual) */}
        <div className="quotes-list-container">
          {loading ? (
            <><ClientSkeleton /><ClientSkeleton /><ClientSkeleton /><ClientSkeleton /><ClientSkeleton /></>
          ) : (
            filteredClients.map((c) => (
              <div key={c.id} className="quote-row-item client-row" onClick={() => navigate(`/admin/users/${c.id}`)}>
                
                <div className="col-ident">
                  <div className="client-profile-box">
                    <div className="avatar-mini">
                       {c.logo_url ? (
                          <img src={`https://oqgkbduqztrpfhfclker.supabase.co/storage/v1/object/public/client-logos/${c.logo_url}`} alt="logo" />
                        ) : (
                          <div className="avatar-initials-mini">{c.name?.charAt(0)}</div>
                        )}
                    </div>
                    <div className="name-stack">
                      <span className="client-name-text">{c.name}</span>
                      <span className="tax-id-sub">{c.tax_id || 'SIN TAX ID'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-client">
                  {c.contact_email ? (
                    <div className="contact-info-pill">
                      <Mail size={12} />
                      <span>{c.contact_email}</span>
                    </div>
                  ) : <span className="empty-label">Sin email</span>}
                </div>

                <div className="col-route">
                   <div className="location-badge">
                      <span className="flag-circle">{getFlag(c.country)}</span>
                      <span className="country-name">{c.country || 'No definido'}</span>
                   </div>
                </div>

                <div className="col-amount">
                   <span className="status-pill-client active">Activo</span>
                </div>

                <div className="col-status">
                   <div className="actions-inline">
                      <button 
                        className="btn-circle orange" 
                        title="Cotización Rápida"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedClientId(c.id);
                          setIsQuoteModalOpen(true);
                        }}
                      >
                        <Calculator size={14} />
                      </button>
                      <button 
                        className="btn-circle green" 
                        title="Reset Clave Acceso"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleResetPassword(c.contact_email); 
                        }}
                      >
                        <KeyRound size={14} />
                      </button>
                   </div>
                   <ChevronRight size={20} className="entry-chevron" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALES */}
      <QuickQuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)} 
        initialClientId={selectedClientId} 
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSuccess={() => {
          fetchClients();
          notify("Cliente creado correctamente", "success");
        }}
      />

      <style>{`
        /* TODO TU CSS ORIGINAL SIN TOCAR UNA COMA */
        .quotes-page-wrapper { padding: 30px; max-width: 1400px; margin: 0 auto; }
        .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .title-group h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
        .title-group p { color: #64748b; font-size: 14px; margin-top: 4px; }

        .btn-main-action { 
          background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 12px; 
          font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;
        }

        .stats-dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .metric-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .metric-card .value { font-size: 24px; font-weight: 700; color: #0f172a; }
        .metric-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; }
        .metric-icon.blue { background: #eff6ff; color: #3b82f6; }
        .metric-icon.green { background: #f0fdf4; color: #10b981; }
        .metric-icon.slate { background: #f8fafc; color: #64748b; }

        .filters-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 25px; }
        .search-container { position: relative; flex: 1; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-container input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; font-size: 14px; outline: none; }
        .sort-toggle { background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer; font-size: 12px; }

        .quotes-list-container { display: flex; flex-direction: column; gap: 10px; }
        .quote-row-item { 
          background: white; padding: 14px 24px; border-radius: 16px; border: 1px solid #f1f5f9;
          display: grid; grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr 1fr; align-items: center;
          cursor: pointer; transition: 0.2s ease;
        }
        .quote-row-item:hover { border-color: #cbd5e1; transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

        .client-profile-box { display: flex; align-items: center; gap: 14px; }
        .avatar-mini { width: 40px; height: 40px; border-radius: 10px; border: 1px solid #f1f5f9; overflow: hidden; background: white; flex-shrink: 0; }
        .avatar-mini img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
        .avatar-initials-mini { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #0f172a; color: white; font-size: 14px; font-weight: 700; }
        
        .client-name-text { display: block; font-size: 14px; font-weight: 700; color: #1e293b; }
        .tax-id-sub { font-size: 11px; color: #94a3b8; font-weight: 600; }

        .contact-info-pill { display: inline-flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 12px; border-radius: 8px; font-size: 12px; color: #64748b; font-weight: 500; }
        .empty-label { color: #cbd5e1; font-size: 12px; font-style: italic; }

        .location-badge { display: flex; align-items: center; gap: 8px; }
        .flag-circle { font-size: 18px; }
        .country-name { font-size: 12px; font-weight: 600; color: #475569; }

        .status-pill-client { 
          padding: 4px 10px; border-radius: 50px; font-size: 10px; font-weight: 800; 
          text-transform: uppercase; background: #dcfce7; color: #166534;
        }

        .actions-inline { display: flex; gap: 8px; margin-right: 12px; }
        .btn-circle { 
          width: 32px; height: 32px; border-radius: 50%; border: 1px solid #f1f5f9; 
          display: flex; align-items: center; justify-content: center; background: white;
          color: #94a3b8; cursor: pointer; transition: 0.2s;
        }
        .btn-circle.orange:hover { background: #fff7ed; color: #f97316; border-color: #fdba74; }
        .btn-circle.green:hover { background: #f0fdf4; color: #10b981; border-color: #86efac; }

        .entry-chevron { color: #cbd5e1; }
        .col-status { display: flex; align-items: center; justify-content: flex-end; }
        
        /* SKELETONS */
        .skeleton-row { pointer-events: none; border-color: #f1f5f9 !important; }
        .skel-avatar { width: 40px; height: 40px; background: #f1f5f9; border-radius: 10px; position: relative; overflow: hidden; }
        .skel-line { height: 12px; background: #f1f5f9; border-radius: 4px; margin-bottom: 8px; position: relative; overflow: hidden; }
        .skel-pill { height: 24px; background: #f1f5f9; border-radius: 50px; position: relative; overflow: hidden; }
        
        .skel-avatar::after, .skel-line::after, .skel-pill::after {
          content: ""; position: absolute; inset: 0; transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer { 100% { transform: translateX(100%); } }

        .w10 { width: 10%; } .w40 { width: 40%; } .w50 { width: 50%; }
        .w60 { width: 60%; } .w70 { width: 70%; } .w80 { width: 80%; }
      `}</style>
    </AdminLayout>
  );
}