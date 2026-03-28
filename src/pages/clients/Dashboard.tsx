import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Activity, MessageSquare, Ship, Clock, ChevronRight,
  Plus, Package, Hash, Building2, FileText, Plane, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ClientLayout } from "@/components/ClientLayout";
import { useNavigate } from 'react-router-dom';
import { CustomerQuoteModal } from '@/components/quotes/CustomerQuoteModal';

const STEPS = [
  { type: "CREATED", label: "Creado" },
  { type: "PACKED", label: "Empaque" },
  { type: "DOCS_READY", label: "Documentación" },
  { type: "AT_ORIGIN", label: "Terminal" },
  { type: "IN_TRANSIT", label: "En Tránsito" },
  { type: "AT_DESTINATION", label: "Destino" },
];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [data, setData] = useState({
    stats: { totalBoxes: 0, pendingQuotes: 0, totalInvestment: 0, newToReview: 0 },
    recentQuotes: [] as any[],
    activeShipments: [] as any[]
  });

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*, clients!inner(*)')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (pError) throw pError;

      const client = profile?.clients;
      if (client) {
        setClientProfile({
          id: client.id,
          name: client.name,
          taxId: client.tax_id || "N/A",
          systemId: client.id?.slice(0, 8).toUpperCase(),
          logo: client.logo_url 
            ? `https://oqgkbduqztrpfhfclker.supabase.co/storage/v1/object/public/client-logos/${client.logo_url}`
            : null,
          initial: client.name?.charAt(0).toUpperCase()
        });

        const [quotesRes, shipmentsRes, allQuotesStats] = await Promise.all([
          // 1. SOLO COTIZACIONES PENDIENTES (Sent o Solicitud)
          supabase.from('quotes')
            .select('*')
            .eq('client_id', client.id)
            .in('status', ['sent', 'Solicitud'])
            .order('created_at', { ascending: false })
            .limit(5),
          
          // 2. SOLO EMBARQUES QUE NO HAN LLEGADO (Excluimos delivered y cancelled)
          supabase.from('shipments')
            .select(`*, milestones (type, at, note)`) 
            .eq('client_id', client.id)
            .not('status', 'in', '("delivered", "cancelled", "AT_DESTINATION")')
            .order('created_at', { ascending: false })
            .limit(3),

          // 3. STATS (Aquí sí sumamos aprobadas para el volumen histórico)
          supabase.from('quotes')
            .select('total, boxes, status')
            .eq('client_id', client.id)
        ]);

        const allQuotes = allQuotesStats.data || [];
        const approvedQuotes = allQuotes.filter(q => q.status === 'approved');
        const pendingToReview = allQuotes.filter(q => q.status === 'sent').length;

        setData({
          stats: {
            totalBoxes: approvedQuotes.reduce((acc, q) => acc + (Number(q.boxes) || 0), 0),
            pendingQuotes: allQuotes.filter(q => q.status === 'sent' || q.status === 'Solicitud').length,
            totalInvestment: approvedQuotes.reduce((acc, q) => acc + (Number(q.total) || 0), 0),
            newToReview: pendingToReview
          },
          recentQuotes: quotesRes.data || [],
          activeShipments: shipmentsRes.data || []
        });
      }
    } catch (e) { 
      console.error("Sync Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleCloseModal = () => {
    setIsQuoteModalOpen(false);
    setTimeout(() => {
      fetchDashboardData(true); 
    }, 100);
  };

  const getCurrentStepIndex = (milestones: any[], flightStatus?: string) => {
    if (!milestones || milestones.length === 0) return 0;
    const types = new Set(milestones.map((m) => String(m.type).toUpperCase()));
    let idx = 0;
    for (let i = 0; i < STEPS.length; i++) { 
        if (types.has(String(STEPS[i].type).toUpperCase())) idx = i; 
    }
    if (flightStatus?.toLowerCase() === 'landed') return STEPS.length - 1;
    return idx;
  };

  if (loading) return <div className="loader-container"><div className="ff-loader-ring"></div></div>;

  return (
    <ClientLayout title="Dashboard" subtitle="Resumen de Operaciones Activas">
      <div className="corp-container">
        
        {/* --- WARNING STRIP --- */}
        {data.stats.newToReview > 0 && (
          <div className="ff-alert-strip animate-slide-down">
            <div className="alert-content">
              <div className="alert-icon-box">
                <AlertCircle size={18} className="pulse-icon" />
              </div>
              <span>Tiene <b>{data.stats.newToReview} {data.stats.newToReview === 1 ? 'cotización pendiente' : 'cotizaciones pendientes'}</b> de revisión.</span>
            </div>
            <button onClick={() => navigate('/clients/quotes?filter=pending')} className="btn-alert-action">
              Revisar ahora <ChevronRight size={14}/>
            </button>
          </div>
        )}

        <div className="corp-profile-bar">
           <div className="partner-identity">
              <div className="partner-avatar">
                {clientProfile?.logo ? <img src={clientProfile.logo} alt="Partner" /> : <span>{clientProfile?.initial}</span>}
              </div>
              <div className="partner-info">
                <span className="corp-tag">Partner Certificado</span>
                <h2>{clientProfile?.name}</h2>
                <div className="corp-meta">
                  <span className="meta-pill"><Hash size={12} /> ID: {clientProfile?.systemId}</span>
                  <span className="meta-pill"><Building2 size={12} /> Tax ID: {clientProfile?.taxId}</span>
                </div>
              </div>
           </div>
           <button className="btn-corp-primary" onClick={() => setIsQuoteModalOpen(true)}>
              <Plus size={18} /> <span>Solicitar Cotización</span>
           </button>
        </div>

        <div className="corp-stats-grid">
           <div className="stat-card">
              <label>Volumen histórico aceptado</label>
              <div className="stat-val">
                <h3>USD {data.stats.totalInvestment.toLocaleString()}</h3>
                <div className="trend-up"><TrendingUp size={14} /></div>
              </div>
           </div>
           <div className="stat-card">
              <label>Cajas recibidas</label>
              <div className="stat-val">
                <h3>{data.stats.totalBoxes.toLocaleString()} <small>Cajas</small></h3>
                <Package size={16} className="text-slate-400" />
              </div>
           </div>
           <div className="stat-card clickable" onClick={() => window.open('https://wa.me/50762256452')}>
              <label>Asistencia logística</label>
              <div className="stat-val">
                <h3>Chat Directo 24/7</h3>
                <MessageSquare size={16} className="text-emerald-600" />
              </div>
           </div>
        </div>

        <div className="corp-dual-layout">
          {/* COLUMNA 1: PIPELINE (Solo pendientes) */}
          <section className="corp-panel">
            <div className="panel-top">
              <div className="panel-title">
                <FileText size={18} className="text-amber-600" />
                <h3>Pipeline Comercial Pendiente</h3>
              </div>
              <button className="btn-link" onClick={() => navigate('/clients/quotes')}>Historial</button>
            </div>
            
            <div className="corp-list">
              {data.recentQuotes.length === 0 ? (
                <div className="corp-empty">Sin gestiones pendientes de aprobación.</div>
              ) : (
                data.recentQuotes.map(q => (
                  <div key={q.id} className="corp-item" onClick={() => navigate(`/clients/quotes/${q.id}`)}>
                    <div className="item-main">
                      <span className="item-dest">{q.destination}</span>
                      <span className="item-ref">{q.quote_number || 'NUEVA SOLICITUD'}</span>
                    </div>
                    <div className="item-side">
                      <span className="item-price">${Number(q.total).toLocaleString()}</span>
                      <span className={`corp-badge ${q.status}`}>
                        {q.status === 'sent' ? 'Revisión' : 'Enviada'}
                      </span>
                    </div>
                    <ChevronRight size={14} className="chevron" />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* COLUMNA 2: SEGUIMIENTO (Solo en curso) */}
          <section className="corp-panel">
            <div className="panel-top">
              <div className="panel-title">
                <Ship size={18} className="text-emerald-700" />
                <h3>Logística en Curso</h3>
              </div>
              <div className="live-indicator"><span className="ping"></span> En Vivo</div>
            </div>

            <div className="corp-list">
              {data.activeShipments.length === 0 ? (
                <div className="corp-empty">No hay embarques activos en tránsito.</div>
              ) : (
                data.activeShipments.map(ship => {
                  const currentIdx = getCurrentStepIndex(ship.milestones, ship.flight_status);
                  return (
                    <div key={ship.id} className="ship-card-minimal" onClick={() => navigate(`/clients/shipments/${ship.id}`)}>
                      <div className="ship-top">
                        <div className="ship-id">
                          {ship.product_mode?.toLowerCase().includes('air') ? <Plane size={12}/> : <Ship size={12}/>}
                          <span>{ship.code}</span>
                        </div>
                        <span className="ship-dest">{ship.destination}</span>
                      </div>
                      <div className="corp-stepper">
                        <div className="stepper-rail">
                          <div className="stepper-fill" style={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}></div>
                        </div>
                        <div className="stepper-points">
                          {STEPS.map((_, i) => (
                            <div key={i} className={`point ${i <= currentIdx ? 'achieved' : ''}`}>
                                {i < currentIdx && <CheckCircle2 size={8} className="point-check" />}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ship-footer">
                        <span className="current-step">{STEPS[currentIdx].label}</span>
                        <span className="awb">AWB: {ship.awb || '— — —'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <CustomerQuoteModal isOpen={isQuoteModalOpen} onClose={handleCloseModal} />
      </div>

      <style>{`
        .corp-container { display: flex; flex-direction: column; gap: 32px; padding: 8px 0; }
        .ff-alert-strip { background: #fffbeb; border: 1px solid #fde68a; padding: 12px 24px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; color: #92400e; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.1); }
        .alert-content { display: flex; align-items: center; gap: 12px; font-size: 14px; }
        .alert-icon-box { background: #fef3c7; width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; }
        .btn-alert-action { background: #92400e; color: white; border: none; padding: 8px 16px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .btn-alert-action:hover { background: #78350f; }

        .corp-profile-bar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
        .partner-identity { display: flex; align-items: center; gap: 20px; }
        .partner-avatar { width: 56px; height: 56px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; display: grid; place-items: center; font-size: 20px; font-weight: 700; color: #284b2c; overflow: hidden; }
        .partner-avatar img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }
        .corp-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #10b981; letter-spacing: 1px; }
        .partner-info h2 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 2px 0; letter-spacing: -0.8px; }
        .corp-meta { display: flex; gap: 12px; }
        .meta-pill { font-size: 11px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }
        .btn-corp-primary { background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .btn-corp-primary:hover { background: #1e293b; transform: translateY(-1px); }
        .corp-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .stat-card { background: white; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px; }
        .stat-card.clickable:hover { border-color: #284b2c; cursor: pointer; }
        .stat-card label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .stat-val { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 8px; }
        .stat-val h3 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
        .trend-up { color: #10b981; background: #f0fdf4; padding: 4px; border-radius: 6px; }
        .corp-dual-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .corp-panel { display: flex; flex-direction: column; gap: 20px; }
        .panel-top { display: flex; justify-content: space-between; align-items: center; }
        .panel-title { display: flex; align-items: center; gap: 10px; }
        .panel-title h3 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }
        .btn-link { background: none; border: none; color: #284b2c; font-weight: 700; font-size: 12px; cursor: pointer; }
        .live-indicator { font-size: 10px; font-weight: 800; color: #10b981; display: flex; align-items: center; gap: 6px; text-transform: uppercase; }
        .ping { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse-ping 2s infinite; }
        @keyframes pulse-ping { 0% { transform: scale(0.9); opacity: 1; } 70% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(0.9); opacity: 1; } }
        .corp-list { display: flex; flex-direction: column; gap: 12px; }
        .corp-item { background: white; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; display: flex; align-items: center; cursor: pointer; transition: 0.2s; }
        .corp-item:hover { border-color: #284b2c; transform: translateX(4px); }
        .item-main { flex: 1; display: flex; flex-direction: column; }
        .item-dest { font-size: 14px; font-weight: 700; color: #0f172a; }
        .item-ref { font-size: 11px; font-family: monospace; color: #94a3b8; }
        .item-side { text-align: right; margin-right: 15px; }
        .item-price { display: block; font-size: 14px; font-weight: 800; color: #0f172a; }
        .corp-badge { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
        .corp-badge.sent { background: #fffbeb; color: #92400e; }
        .corp-badge.Solicitud { background: #f0f9ff; color: #0284c7; }
        .ship-card-minimal { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; cursor: pointer; transition: 0.2s; }
        .ship-card-minimal:hover { background: white; border-color: #10b981; }
        .ship-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .ship-id { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #0f172a; }
        .corp-stepper { position: relative; margin: 20px 0; }
        .stepper-rail { height: 4px; background: #e2e8f0; border-radius: 2px; }
        .stepper-fill { height: 100%; background: #284b2c; border-radius: 2px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .stepper-points { position: absolute; top: -3px; left: 0; width: 100%; display: flex; justify-content: space-between; }
        .point { width: 10px; height: 10px; background: white; border: 2px solid #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .point.achieved { background: #284b2c; border-color: #284b2c; }
        .point-check { color: white; }
        .ship-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
        .current-step { font-size: 10px; font-weight: 800; color: #284b2c; text-transform: uppercase; }
        .awb { font-size: 10px; color: #94a3b8; font-family: monospace; }
        .loader-container { display: grid; place-items: center; height: 400px; }
        .ff-loader-ring { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #284b2c; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .corp-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13px; background: #f8fafc; border-radius: 12px; border: 1px dashed #e2e8f0; }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </ClientLayout>
  );
}