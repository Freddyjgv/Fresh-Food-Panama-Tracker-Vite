import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  Search, Plane, Ship, CheckCircle, SortAsc, 
  AlertCircle, FileText, ChevronRight, X, Clock, ShoppingBag
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { getApiBase } from "../../../lib/apiBase";
import { ClientLayout } from "../../../components/ClientLayout";

type QuoteRow = {
  id: string;
  quote_number?: string;
  quote_no?: string;
  created_at: string;
  status: string;
  mode: "AIR" | "SEA";
  destination: string;
  boxes: number;
  product_details?: any;
  total?: number | null;
  total_amount?: number | null;
  po_number?: string;
};

const getFlag = (dest: string) => {
  if (!dest) return "📍";
  const d = dest.toUpperCase();
  const flags: Record<string, string> = {
    "AMSTERDAM": "🇳🇱", "HOLANDA": "🇳🇱", "NETHERLANDS": "🇳🇱",
    "PANAMA": "🇵🇦", "PTY": "🇵🇦", "USA": "🇺🇸", "MIAMI": "🇺🇸",
    "ESPAÑA": "🇪🇸", "MADRID": "🇪🇸", "BARAJAS": "🇪🇸"
  };
  const found = Object.keys(flags).find(key => d.includes(key));
  return found ? flags[found] : "✈️"; 
};

const translateStatus = (s: string) => {
  const mapping: Record<string, string> = {
    'sent': 'Esperando Aprobación',
    'approved': 'Orden de Compra',
    'rejected': 'Rechazada',
    'expired': 'Expirada'
  };
  return mapping[s.toLowerCase()] || s;
};

const QuoteSkeleton = () => (
  <div className="quote-row-item skeleton-row">
    <div className="col-ident"><div className="skel-line w50"></div><div className="skel-line w80"></div></div>
    <div className="col-route"><div className="skel-pill w100" style={{ height: '28px' }}></div></div>
    <div className="col-amount"><div className="skel-line w60" style={{ marginLeft: 'auto' }}></div></div>
    <div className="col-status"><div className="skel-pill w70"></div></div>
  </div>
);

export default function ClientQuotesIndex() {
  const navigate = useNavigate();
  const [items, setItems] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  // --- MÉTRICAS PURAMENTE DOCUMENTALES ---
  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'sent').length,
      orders: items.filter(i => i.status === 'approved').length
    };
  }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/login");

      const p = new URLSearchParams();
      p.set("dir", dir);
      p.set("sortField", "created_at");
      if (status) p.set("status", status);
      if (q.trim()) p.set("q", q.trim());

      const url = `${getApiBase()}/.netlify/functions/listQuotes?${p.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const json = await res.json();
      
      // Seguridad: Solo estados visibles para el cliente
      const clientItems = (json.items || []).filter((i: any) => 
        i.status === 'sent' || i.status === 'approved' || i.status === 'rejected'
      );
      setItems(clientItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dir, status, q, navigate]);

  useEffect(() => { load(); }, [load]);

  return (
    <ClientLayout title="Mis Cotizaciones">
      <div className="quotes-page-wrapper">
        <div className="header-section">
          <div className="title-group">
            <h1>Mis Documentos Comerciales</h1>
            <p>Gestiona tus ofertas activas y revisa el historial de compras</p>
          </div>
        </div>

        {/* --- STATS DASHBOARD AJUSTADO --- */}
        <div className="stats-dashboard">
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Cotizaciones Totales</span>
              <span className="value">{stats.total}</span>
            </div>
            <div className="metric-icon blue"><FileText size={24} /></div>
          </div>
          <div className={`metric-card highlight-card ${stats.pending > 0 ? 'active' : ''}`}>
            <div className="metric-content">
              <span className="metric-label">Pendientes de Aprobación</span>
              <span className="value">{stats.pending}</span>
            </div>
            <div className={`metric-icon ${stats.pending > 0 ? 'orange-pulse' : 'slate'}`}>
              <Clock size={24} />
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Órdenes de Compra</span>
              <span className="value">{stats.orders}</span>
            </div>
            <div className="metric-icon green"><ShoppingBag size={24} /></div>
          </div>
        </div>

        <div className="filters-bar">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input placeholder="Buscar por número o destino..." value={q} onChange={e => setQ(e.target.value)} />
            {q && <X size={16} className="clear-search" onClick={() => setQ("")} />}
          </div>
          <div className="quick-filters">
            {['sent', 'approved'].map(s => (
              <button key={s} className={`filter-pill ${status === s ? 'active' : ''}`} onClick={() => setStatus(status === s ? "" : s)}>
                {translateStatus(s)}
              </button>
            ))}
          </div>
          <button className="sort-toggle" onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>
            <SortAsc size={16} /> {dir === 'desc' ? 'Recientes' : 'Antiguos'}
          </button>
        </div>

        <div className="quotes-list-container">
          {loading ? (
            <><QuoteSkeleton /><QuoteSkeleton /><QuoteSkeleton /></>
          ) : items.length === 0 ? (
            <div className="empty-state-client">No se encontraron documentos registrados.</div>
          ) : (
            items.map((r) => {
              const displayId = r.quote_number || r.quote_no;
              const productInfo = r.product_details?.variety || "Piña MD2 Golden";

              return (
                <div 
                  key={r.id} 
                  className={`quote-row-item ${r.status === 'sent' ? 'is-pending-row' : ''}`} 
                  onClick={() => navigate(`/clients/quotes/${r.id}`)}
                > 
                  <div className="col-ident">
                    <span className="id-number">{displayId}</span>
                    <span className="product-variety">{productInfo}</span>
                    <span className="badge-boxes">{r.boxes || 0} CAJAS</span>
                  </div>

                  <div className="col-route">
                    <div className="route-timeline">
                      <span className="flag">🇵🇦</span>
                      <div className="connector">
                        <div className="line"></div>
                        <div className="mode-icon">
                          {r.mode === 'SEA' ? <Ship size={12} /> : <Plane size={12} />}
                        </div>
                      </div>
                      <span className="flag">{getFlag(r.destination)}</span>
                      <span className="dest-text">{r.destination}</span>
                    </div>
                  </div>

                  <div className="col-amount">
                    <span className="amount-val">
                      <small>USD</small> {(r.total_amount || r.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {r.status === 'approved' && <span className="po-ref">Ref: {r.po_number}</span>}
                  </div>

                  <div className="col-status">
                    <StatusPill v={r.status} />
                    <ChevronRight size={20} className="entry-chevron" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .quotes-page-wrapper { padding: 30px; max-width: 1400px; margin: 0 auto; }
        .header-section { margin-bottom: 35px; }
        .title-group h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
        .title-group p { color: #64748b; font-size: 14px; margin-top: 4px; }
        
        .stats-dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; }
        .highlight-card.active { border: 2px solid #f59e0b; background: #fffbeb; }
        .metric-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .metric-card .value { font-size: 26px; font-weight: 800; color: #1e293b; }
        
        .metric-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; }
        .metric-icon.blue { background: #eff6ff; color: #3b82f6; }
        .metric-icon.green { background: #f0fdf4; color: #10b981; }
        .orange-pulse { background: #ffedd5; color: #f59e0b; animation: pulse-small 2s infinite; }
        .metric-icon.slate { background: #f8fafc; color: #64748b; }

        .filters-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 25px; }
        .search-container { position: relative; flex: 1; }
        .search-container input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 14px; outline: none; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        
        .filter-pill { padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; }
        .filter-pill.active { background: #0f172a; color: white; border-color: #0f172a; }
        .sort-toggle { background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer; font-size: 12px; }

        .quotes-list-container { display: flex; flex-direction: column; gap: 10px; }
        .quote-row-item { background: white; padding: 16px 24px; border-radius: 16px; border: 1px solid #f1f5f9; display: grid; grid-template-columns: 1.5fr 2fr 1fr 1fr; align-items: center; cursor: pointer; transition: 0.2s; }
        .is-pending-row { border-left: 4px solid #f59e0b !important; }

        .col-ident { display: flex; flex-direction: column; gap: 2px; }
        .id-number { font-family: monospace; font-size: 12px; font-weight: 800; color: #1e293b; }
        .product-variety { font-size: 10px; color: #94a3b8; }
        .badge-boxes { background: #f0fdf4; color: #16a34a; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; width: fit-content; margin-top: 4px; }

        .route-timeline { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 14px; border-radius: 50px; border: 1px solid #f1f5f9; width: fit-content; }
        .dest-text { font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; }
        
        .col-amount { text-align: right; padding-right: 20px; display: flex; flex-direction: column; }
        .amount-val { font-size: 15px; font-weight: 700; color: #1e293b; }
        .po-ref { font-size: 9px; font-weight: 800; color: #10b981; margin-top: 2px; }

        .col-status { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .empty-state-client { text-align: center; padding: 60px; color: #94a3b8; font-size: 14px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; }

        @keyframes pulse-small { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
        .skeleton-row { pointer-events: none; opacity: 0.6; }
        .skel-line { height: 12px; background: #f1f5f9; border-radius: 4px; margin-bottom: 8px; }
        .skel-pill { height: 24px; background: #f1f5f9; border-radius: 50px; }
      `}</style>
    </ClientLayout>
  );
}

function StatusPill({ v }: { v: string }) {
  const s = String(v || "").toLowerCase();
  const colors: Record<string, any> = {
    approved: { bg: "#dcfce7", text: "#166534" },
    sent: { bg: "#fff7ed", text: "#c2410c" },
    rejected: { bg: "#fee2e2", text: "#b91c1c" }
  };
  const theme = colors[s] || { bg: "#f1f5f9", text: "#475569" };
  return (
    <span style={{ 
      background: theme.bg, color: theme.text, padding: '4px 12px', 
      borderRadius: '50px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'
    }}>{translateStatus(v)}</span>
  );
}