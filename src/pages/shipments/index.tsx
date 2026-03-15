import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; // Cambiado para Vite
import { Search, Calendar, Package, MapPin, RefreshCcw, Plane, ArrowRight, Plus, Layers } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { getApiBase } from "../../lib/apiBase";
import { labelStatus, statusBadgeClass } from "../../lib/shipmentFlow";
import { ClientLayout } from "../../components/ClientLayout";

type Shipment = {
  id: string;
  code: string;
  status: string;
  created_at: string;
  destination: string;
  product_name: string;
  product_variety: string;
  pallets: number;
  boxes: number;
  awb: string;
  flight_number: string;
  client_name?: string;
  last_event_at?: string;
  clients?: {
    id: string;
    name: string;
    legal_name: string;
    logo_url?: string | null;
    tax_id?: string | null;
    billing_address?: string | null;
    phone?: string | null;
    website?: string | null;
    country?: string | null;
  }; 
};

export default function ShipmentsPage() {
  const [items, setItems] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [destFilter, setDestFilter] = useState("");

  const ProductIcon = ({ name }: { name: string }) => {
    const n = name?.toLowerCase() || "";
    let iconColor = "#64748b"; 
    let bgColorClass = "bg-slate";

    if (n.includes("piña")) {
      iconColor = "#ca8a04"; 
      bgColorClass = "bg-yellow";
    } else if (n.includes("aguacate") || n.includes("avocado")) {
      iconColor = "#16a34a";
      bgColorClass = "bg-green";
    } else if (n.includes("papaya")) {
      iconColor = "#ea580c";
      bgColorClass = "bg-orange";
    }

    return (
      <div className={`md-prod-icon-wrapper ${bgColorClass}`}>
        <Package size={22} color={iconColor} strokeWidth={2.5} />
      </div>
    );
  };

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      const params = new URLSearchParams({
        page: "1",
        pageSize: "40",
        q: search,
        destination: destFilter
      });

      const res = await fetch(`${getApiBase()}/.netlify/functions/listShipments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json();
      setItems(json.items || []);
      setTotal(json.total || 0);
    } catch (e) {
      console.error("Error fetching shipments:", e);
    } finally {
      setLoading(false);
    }
  }, [search, destFilter]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  return (
    <ClientLayout title="Panel de Logística" wide>
      <div className="ff-page-wrapper">
        <header className="ff-header-premium">
          <div className="ff-client-profile">
            <div className="ff-logo-wrapper">
              {items[0]?.clients?.logo_url ? (
                <img 
                  src={`https://oqgkbduqztrpfhfclker.supabase.co/storage/v1/object/public/client-logos/${items[0].clients.logo_url}`} 
                  alt="Logo" 
                  className="ff-logo-img"
                  style={{ width: '64px', height: '64px' }}
                />
              ) : (
                <div className="ff-logo-placeholder">
                  {items[0]?.clients?.name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            
            <div className="ff-client-info">
              <h1 className="ff-client-name-display">
                {items[0]?.clients?.legal_name || items[0]?.clients?.name || 'Panel de Control'}
              </h1>
              
              <div className="ff-client-meta-stack">
                <div className="ff-meta-row">
                  <span className="ff-meta-label">TAX ID:</span>
                  <span className="ff-meta-value">{items[0]?.clients?.tax_id || '—'}</span>
                </div>
                <div className="ff-meta-row">
                  <span className="ff-meta-value">{items[0]?.clients?.billing_address || '—'}</span>
                </div>
                <div className="ff-meta-row ff-secondary-meta">
                  <span className="ff-meta-value">T: {items[0]?.clients?.phone || '—'}</span>
                  {items[0]?.clients?.website && (
                    <>
                      <span className="ff-meta-divider">|</span>
                      <span className="ff-meta-value ff-website-link">{items[0].clients.website}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="ff-header-actions">
            <button 
              className="ff-btn-quote-minimal"
              onClick={() => window.open(`https://wa.me/34932620121?text=Hola, deseo solicitar una nueva cotización.`, '_blank')}
            >
              <Plus size={14} />
              <span>SOLICITAR COTIZACIÓN</span>
            </button>
          </div>
        </header>

        <div className="md-toolbar">
          <div className="md-search-box">
            <Search size={18} className="md-icon-muted" />
            <input 
              placeholder="Buscar por código, AWB o producto..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchShipments()}
            />
          </div>
          
          <div className="md-filters">
            <div className="md-select-group">
              <MapPin size={16} className="md-icon-muted" />
              <select value={destFilter} onChange={(e) => setDestFilter(e.target.value)}>
                <option value="">Todos los Destinos</option>
                <option value="MAD">Madrid (MAD)</option>
                <option value="AMS">Amsterdam (AMS)</option>
                <option value="MIA">Miami (MIA)</option>
              </select>
            </div>
            <button className="md-btn-refresh" onClick={fetchShipments} disabled={loading}>
              <RefreshCcw size={16} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        <div className="md-grid">
          {loading ? (
            <div className="md-loading-state">Sincronizando flota...</div>
          ) : (
            items.map((s) => (
              <Link key={s.id} to={`/shipments/${s.id}`} className="md-card-link">
                <div className="md-card">
                  <div className="md-col-info">
                    <ProductIcon name={s.product_name} /> 
                    <div>
                      <h2 className="md-ship-code">{s.code}</h2>
                      <p className="md-product-sub">
                        {s.product_name} <span className="md-variety-dot">•</span> {s.product_variety}
                      </p>
                    </div>
                  </div>

                  <div className="md-col-logistics">
                    <div className="md-route">
                      <span className="md-badge-city">PTY</span>
                      <ArrowRight size={14} className="md-arrow" />
                      <span className="md-badge-city active">{s.destination || "TBD"}</span>
                    </div>
                    <div className="md-cargo-details">
                      <Layers size={12} />
                      <span>{s.pallets || 0} Pallets • {s.boxes || 0} Cajas</span>
                    </div>
                  </div>

                  <div className="md-col-flight">
                    <div className="md-flight-row">
                      <Plane size={14} />
                      <span>{s.flight_number || "— — —"}</span>
                    </div>
                    <div className="md-date-row">
                      <Calendar size={14} />
                      <span>{new Date(s.created_at).toLocaleDateString('es-PA', { day:'2-digit', month:'short' }).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="md-col-status">
                    <span className={`md-status-pill ${statusBadgeClass(s.status)}`}>
                      {labelStatus(s.status)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ff-page-wrapper { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .ff-header-premium {
          background: linear-gradient(135deg, #ffffff 0%, rgba(209, 119, 17, 0.03) 100%);
          padding: 28px 36px;
          border-radius: 24px;
          border: 1px solid rgba(209, 119, 17, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 40px;
        }
        .ff-client-profile { display: flex; align-items: center; gap: 24px; }
        .ff-logo-wrapper { 
          width: 70px; height: 70px; background: white; border-radius: 16px; 
          display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0,0,0,0.03);
        }
        .ff-client-name-display { font-size: 22px; font-weight: 800; color: #1a202c; margin: 0 0 8px 0; }
        .ff-client-meta-stack { display: flex; flex-direction: column; gap: 2px; }
        .ff-meta-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #4a5568; }
        .ff-meta-label { font-weight: 700; color: #718096; font-size: 10px; }
        .ff-btn-quote-minimal {
          border: 1px solid rgba(209, 119, 17, 0.3); color: #d17711;
          padding: 8px 20px; border-radius: 50px; font-size: 11px; font-weight: 700;
          display: flex; align-items: center; gap: 8px; cursor: pointer; background: transparent;
        }
        .md-toolbar { display: flex; gap: 16px; margin-bottom: 30px; }
        .md-search-box { flex: 1; background: white; border: 1px solid #e2e8f0; border-radius: 16px; display: flex; align-items: center; padding: 0 18px; gap: 12px; }
        .md-search-box input { border: none; outline: none; width: 100%; height: 52px; font-size: 15px; }
        .md-filters { display: flex; gap: 12px; }
        .md-select-group { background: white; border: 1px solid #e2e8f0; border-radius: 16px; display: flex; align-items: center; padding: 0 16px; }
        .md-select-group select { border: none; outline: none; height: 52px; font-weight: 700; color: #475569; background: transparent; }
        .md-btn-refresh { width: 52px; height: 52px; border-radius: 16px; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
        .md-grid { display: flex; flex-direction: column; gap: 12px; }
        .md-card { 
          background: white; border: 1px solid #f1f5f9; border-radius: 24px; 
          display: grid; grid-template-columns: 1.8fr 1.2fr 1fr 1fr; 
          align-items: center; padding: 24px 32px; transition: 0.2s ease;
        }
        .md-card-link { text-decoration: none; }
        .md-card-link:hover .md-card { border-color: #cbd5e1; transform: translateY(-3px); }
        .md-ship-code { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; }
        .md-product-sub { font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
        .md-prod-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
        .bg-yellow { background-color: #fefce8; border: 1px solid #fef9c3; }
        .bg-green  { background-color: #f0fdf4; border: 1px solid #dcfce7; }
        .bg-orange { background-color: #fff7ed; border: 1px solid #ffedd5; }
        .bg-slate  { background-color: #f8fafc; border: 1px solid #f1f5f9; }
        .md-col-info { display: flex; align-items: center; gap: 18px; }
        .md-route { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .md-badge-city { font-size: 11px; font-weight: 800; color: #64748b; background: #f8fafc; padding: 4px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .md-badge-city.active { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }
        .md-status-pill { padding: 8px 16px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      ` }} />
    </ClientLayout>
  );
}