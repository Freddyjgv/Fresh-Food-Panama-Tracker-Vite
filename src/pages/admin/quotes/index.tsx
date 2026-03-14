import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  PlusCircle, Search, Plane, Ship, FileText, 
  CheckCircle, SortAsc, AlertCircle, TrendingUp, ChevronRight, X
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { getApiBase } from "../../../lib/apiBase";
import { requireAdminOrRedirect } from "../../../lib/requireAdmin";
import { AdminLayout } from "../../../components/AdminLayout";
import { QuickQuoteModal } from "../../../components/quotes/QuickQuoteModal";

// 1. DEFINICIÓN DE TIPOS
type QuoteRow = {
  id: string;
  quote_number?: string;
  quote_no?: string;
  created_at: string;
  status: string;
  mode: "AIR" | "SEA";
  currency: "USD" | "EUR";
  destination: string;
  boxes: number;
  client_name?: string | null;
  client_snapshot?: any;
  items_snapshot?: any[]; 
  total?: number | null;
  total_amount?: number | null;
};

type ApiResponse = {
  items: QuoteRow[];
  total: number;
};

// 2. HELPERS
const getFlag = (dest: string) => {
  if (!dest) return "📍";
  const d = dest.toUpperCase();
  const flags: Record<string, string> = {
    "AMSTERDAM": "🇳🇱", "HOLANDA": "🇳🇱", "NETHERLANDS": "🇳🇱",
    "PARIS": "🇫🇷", "FRANCIA": "🇫🇷",
    "BELGICA": "🇧🇪", "BELGIUM": "🇧🇪",
    "POLONIA": "🇵🇱", "POLAND": "🇵🇱",
    "PANAMA": "🇵🇦", "PTY": "🇵🇦",
    "ESPAÑA": "🇪🇸", "MADRID": "🇪🇸", "BARAJAS": "🇪🇸",
    "USA": "🇺🇸", "MIAMI": "🇺🇸",
    "COLOMBIA": "🇨🇴", "BOGOTA": "🇨🇴"
  };
  const found = Object.keys(flags).find(key => d.includes(key));
  return found ? flags[found] : "✈️"; 
};

const translateStatus = (s: string) => {
  const mapping: Record<string, string> = {
    'draft': 'Borrador',
    'sent': 'Enviada',
    'approved': 'Aprobada',
    'rejected': 'Rechazada'
  };
  return mapping[s.toLowerCase()] || s;
};

// --- COMPONENTE SKELETON ---
const QuoteSkeleton = () => (
  <div className="quote-row-item skeleton-row">
    <div className="col-ident">
      <div className="skel-line w50"></div>
      <div className="skel-line w80"></div>
      <div className="skel-pill w40" style={{ height: '14px', marginTop: '4px' }}></div>
    </div>
    <div className="col-client">
      <div className="skel-line w100"></div>
    </div>
    <div className="col-route">
      <div className="skel-pill w100" style={{ height: '28px' }}></div>
    </div>
    <div className="col-amount">
      <div className="skel-line w60" style={{ marginLeft: 'auto' }}></div>
    </div>
    <div className="col-status">
      <div className="skel-pill w70"></div>
    </div>
  </div>
);

export default function AdminQuotesIndex() {
  const navigate = useNavigate();
  const [authOk, setAuthOk] = useState(true); 
  const [items, setItems] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const stats = useMemo(() => {
    const approved = items.filter(i => i.status === 'approved');
    const pipeline = items.reduce((acc, curr) => acc + (Number(curr.total || curr.total_amount) || 0), 0);
    return {
      countApproved: approved.length,
      pipeline: pipeline,
      countTotal: items.length
    };
  }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/admin/login");

      const p = new URLSearchParams();
      p.set("dir", dir);
      p.set("sortField", "created_at");
      if (status) p.set("status", status);
      if (q.trim()) p.set("q", q.trim());

      const url = `${getApiBase()}/.netlify/functions/listQuotes?${p.toString()}&t=${new Date().getTime()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const json = await res.json() as ApiResponse;
      setItems(json.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dir, status, q, navigate]);

  useEffect(() => {
    requireAdminOrRedirect().then(r => {
      if (r.ok) load();
      else setAuthOk(false);
    });
  }, [load]);

  if (!authOk) return null;

  return (
    <AdminLayout title="Cotizaciones">
      <div className="quotes-page-wrapper">
        
        {/* HEADER */}
        <div className="header-section">
          <div className="title-group">
            <h1>Panel de Cotizaciones</h1>
            <p>Monitorea el pipeline comercial y estados de envío</p>
          </div>
          <button className="btn-main-action" onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={20} strokeWidth={2} />
            Nueva Cotización
          </button>
        </div>

        {error && (
          <div className="errorBanner" role="alert">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* METRICS */}
        <div className="stats-dashboard">
          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Pipeline Total</span>
              <div className="metric-value-group">
                <span className="currency">USD</span>
                <span className="value">{stats.pipeline?.toLocaleString()}</span>
              </div>
            </div>
            <div className="metric-icon blue"><TrendingUp size={24} /></div>
          </div>

          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Total Cotizaciones</span>
              <span className="value">{stats.countTotal}</span>
            </div>
            <div className="metric-icon slate"><FileText size={24} /></div>
          </div>

          <div className="metric-card">
            <div className="metric-content">
              <span className="metric-label">Aprobadas</span>
              <span className="value">{stats.countApproved}</span>
            </div>
            <div className="metric-icon green"><CheckCircle size={24} /></div>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="filters-bar">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              placeholder="Buscar cliente, destino o número..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
            />
            {q && <X size={16} className="clear-search" onClick={() => setQ("")} />}
          </div>

          <div className="quick-filters">
            {['draft', 'sent', 'approved'].map(s => (
              <button 
                key={s}
                className={`filter-pill ${status === s ? 'active' : ''}`}
                onClick={() => setStatus(status === s ? "" : s)}
              >
                {s === 'draft' ? 'Borrador' : s === 'sent' ? 'Enviada' : 'Aprobada'}
              </button>
            ))}
          </div>

          <button className="sort-toggle" onClick={() => setDir(dir === 'asc' ? 'desc' : 'asc')}>
            <SortAsc size={16} /> {dir === 'desc' ? 'Recientes' : 'Antiguos'}
          </button>
        </div>

        {/* LISTADO REDISEÑADO */}
        <div className="quotes-list-container">
          {loading ? (
            // Renderizamos 5 skeletons mientras carga
            <>
              <QuoteSkeleton />
              <QuoteSkeleton />
              <QuoteSkeleton />
              <QuoteSkeleton />
              <QuoteSkeleton />
            </>
          ) : (
            items.map((r) => {
              const firstItem = r.items_snapshot?.[0];
              const productInfo = firstItem ? `${firstItem.product} ${firstItem.variety || ''}` : 'Varios productos';
              
              return (
                <div key={r.id} className="quote-row-item" onClick={() => navigate(`/admin/quotes/${r.id}`)}>
                  
                  {/* Col 1: ID, Producto y Cajas */}
                  <div className="col-ident">
                    <span className="id-number">{r.quote_number || r.quote_no || 'S/N'}</span>
                    <span className="product-variety">{productInfo}</span>
                    <span className="badge-boxes">{r.boxes || 0} CAJAS</span>
                  </div>

                  {/* Col 2: Cliente */}
                  <div className="col-client">
                    <span className="client-name">{r.client_name || r.client_snapshot?.name || 'Cliente sin nombre'}</span>
                  </div>

                  {/* Col 3: Ruta Visual */}
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

                  {/* Col 4: Monto (Peso Visual Ligero) */}
                  <div className="col-amount">
                    <span className="amount-val">
                      <small>USD</small> {(r.total_amount || r.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Col 5: Status y Acción */}
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

      <QuickQuoteModal 
        isOpen={isModalOpen} 
        onClose={() => { 
          setIsModalOpen(false); 
          load(); 
        }} 
        initialClientId={undefined} 
      />

      <style>{`
        .quotes-page-wrapper { padding: 30px; max-width: 1400px; margin: 0 auto; }
        .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .title-group h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
        .title-group p { color: #64748b; font-size: 14px; margin-top: 4px; }

        .btn-main-action { 
          background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 12px; 
          font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;
        }
        .btn-main-action:hover { background: #1e293b; transform: translateY(-1px); }

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

        .filter-pill { padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; }
        .filter-pill.active { background: #0f172a; color: white; border-color: #0f172a; }
        .sort-toggle { background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer; font-size: 12px; }

        .quotes-list-container { display: flex; flex-direction: column; gap: 10px; }
        .quote-row-item { 
          background: white; padding: 14px 24px; border-radius: 16px; border: 1px solid #f1f5f9;
          display: grid; grid-template-columns: 1.2fr 1.5fr 2fr 1fr 1.2fr; align-items: center;
          cursor: pointer; transition: 0.2s ease;
        }
        .quote-row-item:hover { border-color: #cbd5e1; transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

        .col-ident { display: flex; flex-direction: column; gap: 2px; }
        .id-number { font-family: monospace; font-size: 11px; font-weight: 700; color: #1e293b; }
        .product-variety { font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .badge-boxes { background: #f0fdf4; color: #16a34a; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; width: fit-content; margin-top: 4px; }

        .client-name { font-size: 14px; font-weight: 600; color: #334155; }

        .route-timeline { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px 12px; border-radius: 50px; width: fit-content; border: 1px solid #f1f5f9; }
        .route-timeline .flag { font-size: 14px; }
        .route-timeline .connector { display: flex; align-items: center; position: relative; width: 35px; }
        .route-timeline .line { width: 100%; height: 1px; border-top: 2px dotted #e2e8f0; }
        .route-timeline .mode-icon { position: absolute; left: 50%; transform: translateX(-50%); background: #f8fafc; padding: 0 2px; color: #94a3b8; }
        .route-timeline .dest-text { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }

        .col-amount { text-align: right; padding-right: 20px; }
        .amount-val { font-size: 15px; font-weight: 500; color: #475569; }
        .amount-val small { font-size: 10px; font-weight: 800; color: #94a3b8; margin-right: 2px; }

        .col-status { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .entry-chevron { color: #cbd5e1; }
        
        .loadingState { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; font-weight: 600; }
        .errorBanner { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 12px 16px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; font-size: 13px; }

        /* --- STYLES FOR SKELETON --- */
        .skeleton-row { pointer-events: none; border-color: #f1f5f9 !important; }
        .skel-line { height: 12px; background: #f1f5f9; border-radius: 4px; margin-bottom: 8px; position: relative; overflow: hidden; }
        .skel-pill { height: 24px; background: #f1f5f9; border-radius: 50px; position: relative; overflow: hidden; }
        
        .skel-line::after, .skel-pill::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .w40 { width: 40%; }
        .w50 { width: 50%; }
        .w60 { width: 60%; }
        .w70 { width: 70%; }
        .w80 { width: 80%; }
        .w100 { width: 100%; }

      `}</style>
    </AdminLayout>
  );
}

function StatusPill({ v }: { v: string }) {
  const s = String(v || "").toLowerCase();
  const colors: Record<string, any> = {
    approved: { bg: "#dcfce7", text: "#166534" },
    sent: { bg: "#fff7ed", text: "#c2410c" },
    draft: { bg: "#f1f5f9", text: "#475569" }
  };
  const theme = colors[s] || colors.draft;
  return (
    <span style={{ 
      background: theme.bg, color: theme.text, padding: '4px 12px', 
      borderRadius: '50px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '0.02em', border: '1px solid rgba(0,0,0,0.02)'
    }}>{translateStatus(v)}</span>
  );
}