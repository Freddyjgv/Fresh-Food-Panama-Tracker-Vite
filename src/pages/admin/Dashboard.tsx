import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, Users, FileText, Plus, 
  History, Ship, Loader2, Globe, Plane, ArrowRight, TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AdminLayout } from "@/components/AdminLayout";
import { useNavigate } from 'react-router-dom';

import { QuickQuoteModal } from '@/components/quotes/QuickQuoteModal';
import { NewShipmentModal } from '@/components/shipments/NewShipmentModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  const [data, setData] = useState({
    stats: { shipments: 0, clients: 0, quotes: 0, pipeline: 0 },
    recentQuotes: [] as any[],
    recentShipments: [] as any[],
    recentClients: [] as any[]
  });

  // Extraemos la lógica a useCallback para poder re-usarla
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. KPIs y Pipeline (Usando 'total' que hallamos en SQL)
      const [shipmentsCount, clientsCount, quotesCount, pipelineData] = await Promise.all([
        supabase.from('shipments').select('*', { count: 'exact', head: true })
          .not('status', 'in', '("delivered", "cancelled")'),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true })
          .eq('status', 'sent'),
        supabase.from('quotes').select('total').in('status', ['sent', 'approved'])
      ]);

      const totalPipeline = pipelineData.data?.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0) || 0;

      // 2. Datos de Columnas (Aseguramos traer total y logo_url)
      const [quotes, ships, cls] = await Promise.all([
        supabase.from('quotes').select('*, clients(name)').order('created_at', { ascending: false }).limit(6),
        supabase.from('shipments').select('*, clients(name)').order('created_at', { ascending: false }).limit(6),
        supabase.from('clients').select('*').order('updated_at', { ascending: false }).limit(6)
      ]);

      setData({
        stats: {
          shipments: shipmentsCount.count || 0,
          clients: clientsCount.count || 0,
          quotes: quotesCount.count || 0,
          pipeline: totalPipeline
        },
        recentQuotes: quotes.data || [],
        recentShipments: ships.data || [],
        recentClients: cls.data || []
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSuccess = () => {
    fetchDashboardData();
    setShowShipmentModal(false);
    setShowQuoteModal(false);
  };

  const formatCurrency = (val: number | null) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(val || 0);
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="ff-loading-state">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
          <p className="font-medium text-slate-500">Sincronizando operaciones...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Panel de Control Maestro">
      <div className="ff-dashboard-wrapper animate-in">
        
        {/* KPI SECTION */}
        <header className="dashboard-hero">
          <div className="stats-glass-container">
            <div className="kpi-card blue pulse-blue">
              <div className="kpi-icon-box"><Plane size={18}/></div>
              <div className="kpi-content">
                <span className="kpi-v">{data.stats.shipments}</span>
                <span className="kpi-l">Activos</span>
              </div>
            </div>
            {/* KPI Nuevo: Pipeline Comercial */}
            <div className="kpi-card green">
              <div className="kpi-icon-box"><TrendingUp size={18}/></div>
              <div className="kpi-content">
                <span className="kpi-v" style={{fontSize: '16px'}}>{formatCurrency(data.stats.pipeline)}</span>
                <span className="kpi-l">Pipeline</span>
              </div>
            </div>
            <div className="kpi-card amber">
              <div className="kpi-icon-box"><FileText size={18}/></div>
              <div className="kpi-content">
                <span className="kpi-v">{data.stats.quotes}</span>
                <span className="kpi-l">Pendientes</span>
              </div>
            </div>
          </div>

          <div className="action-hub">
            <button className="btn-main-action primary pulse-gold" onClick={() => setShowShipmentModal(true)}>
              <Plus size={18} /> Nuevo Embarque
            </button>
            <button className="btn-main-action secondary" onClick={() => setShowQuoteModal(true)}>
              <Plus size={18} /> Nueva Cotización
            </button>
          </div>
        </header>

        {/* COLUMNS GRID */}
        <main className="dashboard-grid-mesh">
          
          {/* COL 1: COTIZACIONES (Arreglada columna 'total') */}
          <section className="mesh-column">
            <div className="column-head">
              <h3>Cotizaciones</h3>
              <button className="btn-view-all" onClick={() => navigate('/admin/quotes')}>Ver todas</button>
            </div>
            <div className="mesh-list">
              {data.recentQuotes.map(q => (
                <div key={q.id} className="mesh-item" onClick={() => navigate(`/admin/quotes/${q.id}`)}>
                  <div className="mesh-main-info">
                    <span className="mesh-title">{q.quote_number || q.quote_no || 'S/N'}</span>
                    <span className="mesh-sub">{q.clients?.name || 'Empresa Indefinida'}</span>
                  </div>
                  <div className="mesh-side-data">
                    <span className="mesh-amount">{formatCurrency(q.total)}</span>
                    <div className={`status-tag ${q.status?.toLowerCase()}`}>{q.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COL 2: EMBARQUES */}
          <section className="mesh-column">
            <div className="column-head">
              <h3>Embarques</h3>
              <button className="btn-view-all" onClick={() => navigate('/admin/shipments')}>Ver todos</button>
            </div>
            <div className="mesh-list">
              {data.recentShipments.map(s => (
                <div key={s.id} className="mesh-item" onClick={() => navigate(`/admin/shipments/${s.id}`)}>
                  <div className="mesh-main-info">
                    <span className="mesh-title">{s.code}</span>
                    <span className="mesh-sub">{s.clients?.name || 'Cargando Cliente...'}</span>
                  </div>
                  <div className="mode-indicator">
                    <div className="dot-pulse-mini"></div>
                    {s.product_mode === 'Aereo' ? <Plane size={14}/> : <Globe size={14}/>}
                    <span>{s.destination?.split(',')[0] || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COL 3: CLIENTES (Arreglada alineación y Avatar del bucket) */}
          <section className="mesh-column">
            <div className="column-head">
              <h3>Clientes Recientes</h3>
            </div>
            <div className="mesh-list">
              {data.recentClients.map(c => {
                const logoUrl = c.logo_url 
                  ? `https://mpxfzvunmzkpzmxtlykb.supabase.co/storage/v1/object/public/client-logos/${c.logo_url}`
                  : null;

                return (
                  <div key={c.id} className="mesh-item flex-align-center" onClick={() => navigate(`/admin/users/${c.id}`)}>
                    <div className="client-info-wrapper">
                      <div className="client-avatar-mini">
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="avatar-img" onError={(e) => e.currentTarget.style.display='none'} />
                        ) : (
                          c.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="mesh-main-info">
                        <span className="mesh-title-clean">{c.name}</span>
                        <span className="mesh-sub">{c.country || 'Panamá'}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="mesh-arrow" />
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        {showShipmentModal && (
          <NewShipmentModal 
            isOpen={true}
            onClose={() => setShowShipmentModal(false)} 
            {...({ refresh: handleSuccess, onSuccess: handleSuccess } as any)} 
          />
        )}

        {showQuoteModal && (
          <QuickQuoteModal 
            isOpen={true} 
            onClose={() => setShowQuoteModal(false)} 
            {...({ refresh: handleSuccess, onSuccess: handleSuccess } as any)} 
          />
        )}

        <style>{`
          .ff-dashboard-wrapper { padding: 10px 0; }
          .dashboard-hero { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; gap: 20px; }
          .stats-glass-container { display: flex; gap: 12px; background: white; padding: 10px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 10px rgba(0,0,0,0.01); }
          .kpi-card { display: flex; align-items: center; gap: 14px; padding: 12px 24px; border-radius: 16px; min-width: 150px; }
          .blue { background: #f0f7ff; } .green { background: #f0fdf4; } .amber { background: #fffbeb; }
          .kpi-icon-box { background: white; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.04); }
          
          /* PULSES */
          .pulse-blue { animation: shadow-pulse 2s infinite; }
          @keyframes shadow-pulse { 0% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.2); } 70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0); } }
          
          .pulse-gold { animation: shadow-pulse-dark 2.5s infinite; }
          @keyframes shadow-pulse-dark { 0% { box-shadow: 0 0 0 0px rgba(15, 23, 42, 0.2); } 70% { box-shadow: 0 0 0 12px rgba(15, 23, 42, 0); } 100% { box-shadow: 0 0 0 0px rgba(15, 23, 42, 0); } }

          .dot-pulse-mini { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: dot-blink 1.5s infinite; margin-right: 4px; }
          @keyframes dot-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

          .kpi-v { font-size: 22px; font-weight: 600; color: #1e293b; display: block; line-height: 1; margin-bottom: 2px; }
          .kpi-l { font-size: 11px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
          
          .dashboard-grid-mesh { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
          .mesh-column { background: white; border-radius: 26px; border: 1px solid #f1f5f9; padding: 24px; }
          .mesh-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 18px; transition: 0.2s; cursor: pointer; border: 1px solid transparent; margin-bottom: 4px; }
          .mesh-item:hover { background: #f8fafc; border-color: #f1f5f9; }

          /* CORRECCIÓN COLUMNA 3 */
          .flex-align-center { align-items: center; }
          .client-info-wrapper { display: flex; align-items: center; gap: 12px; }
          .client-avatar-mini { 
            width: 40px; height: 40px; background: #f1f5f9; border-radius: 12px; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 700; color: #64748b; flex-shrink: 0; overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .avatar-img { width: 100%; height: 100%; object-fit: cover; }

          .mesh-amount { font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; }
          .status-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; background: #f1f5f9; color: #64748b; }
          .status-tag.sent, .status-tag.approved { background: #dcfce7; color: #15803d; }
          
          .btn-main-action { display: flex; align-items: center; gap: 10px; padding: 12px 22px; border-radius: 15px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: 0.2s; }
          .primary { background: #0f172a; color: white; }
          .secondary { background: white; color: #475569; border: 1px solid #e2e8f0; }
        `}</style>
      </div>
    </AdminLayout>
  );
}