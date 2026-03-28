import { useEffect, useMemo, useState } from "react";

type StepType = "CREATED" | "PACKED" | "DOCS_READY" | "AT_ORIGIN" | "IN_TRANSIT" | "AT_DESTINATION" | string;
type Milestone = { type: StepType; at?: string | null; created_at?: string | null; note?: string | null; };

const STEPS: { type: StepType; label: string }[] = [
  { type: "CREATED", label: "Pedido Creado" },
  { type: "PACKED", label: "Preparación" },
  { type: "DOCS_READY", label: "Aduana / Docs" },
  { type: "AT_ORIGIN", label: "Terminal Origen" },
  { type: "IN_TRANSIT", label: "En Tránsito" },
  { type: "AT_DESTINATION", label: "Entregado" },
];

export function ProgressStepper({ 
  milestones, 
  flightNumber, 
  awb, 
  introMs = 1600,
  flightStatus,
  departureTime,
  arrivalTime
}: { 
  milestones: Milestone[]; 
  flightNumber?: string | null; 
  awb?: string | null; 
  introMs?: number; 
  flightStatus?: string | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
}) {
  const currentIndex = useMemo(() => {
    const types = new Set((milestones ?? []).map((m) => String(m.type).toUpperCase()));
    let idx = 0;
    for (let i = 0; i < STEPS.length; i++) { 
        if (types.has(String(STEPS[i].type).toUpperCase())) idx = i; 
    }
    if (flightStatus === 'landed') return STEPS.length - 1;
    return idx;
  }, [milestones, flightStatus]);

  const [pct, setPct] = useState(0);
  const targetPct = useMemo(() => (currentIndex / (STEPS.length - 1)) * 100, [currentIndex]);

  useEffect(() => {
    const t = setTimeout(() => setPct(targetPct), 200);
    return () => clearTimeout(t);
  }, [targetPct]);

  const hitMap = useMemo(() => {
    const m = new Map<string, Milestone>();
    (milestones ?? []).forEach((x) => m.set(String(x.type).toUpperCase(), x));
    return m;
  }, [milestones]);

  return (
    <div className="fresh-saas-container">
      {/* HEADER: Aireado y limpio */}
      <div className="fresh-header">
        <div className="fresh-brand-info">
          <div className={`fresh-badge ${flightStatus === 'active' ? 'is-active' : ''}`}>
            <span className="fresh-ping"></span>
            {flightStatus === 'active' ? 'MONITOREO ACTIVO' : 'ESTADO DE CARGA'}
          </div>
          <h2 className="fresh-title">Seguimiento de embarque</h2>
          <p className="fresh-subtitle">Estado: <span className="fresh-highlight">{STEPS[currentIndex].label}</span></p>
        </div>

        <div className="fresh-data-group">
          <div className="fresh-data-card">
            <span className="fresh-data-label">GUÍA (AWB)</span>
            <span className="fresh-data-value mono">{awb || "---"}</span>
          </div>
          <div className="fresh-data-card fresh-link-active">
            <span className="fresh-data-label">ID VUELO</span>
            <span className="fresh-data-value">✈ {flightNumber || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* TRACKER AREA */}
      <div className="fresh-track-wrapper">
        <div className="fresh-rail-bg">
          <div className="fresh-rail-fill" style={{ width: `${pct}%` }}>
             {flightStatus === 'active' && <div className="fresh-shimmer-line"></div>}
          </div>
        </div>

        <div className="fresh-steps-container">
          {STEPS.map((s, i) => {
            const isDone = i <= currentIndex;
            const isActive = i === currentIndex;
            const hit = hitMap.get(String(s.type).toUpperCase());
            const hasData = hit?.note || (s.type === "AT_DESTINATION" && arrivalTime) || (s.type === "IN_TRANSIT" && departureTime);
            
            // Alineación inteligente del tooltip
            const align = i === 0 ? 'align-left' : i === STEPS.length - 1 ? 'align-right' : 'align-center';

            const timeLabel = hit 
              ? new Date(hit.at || hit.created_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
              : "--:--";

            return (
              <div key={i} className={`fresh-step-node ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                <div className="fresh-node-trigger">
                  <div className="fresh-dot-outer">
                    {isDone ? <svg viewBox="0 0 24 24" className="fresh-icon-check"><path d="M20 6L9 17L4 12" /></svg> : <div className="fresh-dot-inner" />}
                  </div>
                  
                  {isActive && <div className="fresh-halo-ring"></div>}
                  {hasData && <div className="fresh-alert-dot"></div>}

                  {/* TOOLTIP CONECTADO AL API/DB */}
                  <div className={`fresh-tooltip ${align}`}>
                    <div className="fresh-tooltip-box">
                      <div className="fresh-tt-header">REGISTRO DE BITÁCORA</div>
                      <p className="fresh-tt-body">{hit?.note || `Operación confirmada: ${s.label}`}</p>
                      
                      {/* Lógica de horarios dinámica */}
                      {(s.type === "IN_TRANSIT" || s.type === "AT_DESTINATION") && (
                        <div className="fresh-tt-footer">
                          {departureTime && <div>Salida: {new Date(departureTime).toLocaleTimeString()}</div>}
                          {arrivalTime && <div>Llegada: {new Date(arrivalTime).toLocaleTimeString()}</div>}
                        </div>
                      )}
                    </div>
                    <div className="fresh-tooltip-arrow"></div>
                  </div>
                </div>

                <div className="fresh-label-box">
                  <span className="fresh-node-label">{s.label}</span>
                  <span className="fresh-node-time">{timeLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .fresh-saas-container {
          background: #fcfcfc;
          padding: 60px;
          border-radius: 24px;
          color: #334155;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          max-width: 1050px;
          margin: auto;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          position: relative;
        }

        .fresh-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 80px; }
        .fresh-badge { 
          display: inline-flex; align-items: center; gap: 8px; background: #f1f5f9;
          padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 800; color: #64748b;
          letter-spacing: 0.5px; border: 1px solid #e2e8f0;
        }
        .fresh-badge.is-active { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .fresh-ping { width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
        .is-active .fresh-ping { animation: fresh-pulse 1.5s infinite; }

        .fresh-title { font-size: 28px; font-weight: 800; color: #1e293b; margin: 12px 0 4px; }
        .fresh-subtitle { color: #64748b; font-size: 15px; }
        .fresh-highlight { color: #059669; font-weight: 700; }

        .fresh-data-group { display: flex; gap: 12px; }
        .fresh-data-card { 
          background: #ffffff; padding: 14px 20px; border-radius: 16px; border: 1px solid #e2e8f0; 
          min-width: 150px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .fresh-link-active { border-right: 3px solid #fb923c; } /* Borde naranja sutil */
        .fresh-data-label { display: block; font-size: 9px; font-weight: 800; color: #94a3b8; margin-bottom: 4px; }
        .fresh-data-value { font-size: 14px; font-weight: 700; color: #1e293b; }

        /* TRACKER */
        .fresh-track-wrapper { position: relative; margin-top: 40px; }
        .fresh-rail-bg { position: absolute; top: 22px; left: 0; right: 0; height: 4px; background: #f1f5f9; border-radius: 10px; z-index: 1; overflow: hidden; }
        .fresh-rail-fill { 
          height: 100%; background: #10b981; border-radius: 10px; 
          transition: width ${introMs}ms cubic-bezier(0.4, 0, 0.2, 1); position: relative;
        }
        .fresh-shimmer-line {
          position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: saas-shimmer 2s infinite linear;
        }

        .fresh-steps-container { display: flex; justify-content: space-between; position: relative; z-index: 2; }
        .fresh-step-node { display: flex; flex-direction: column; align-items: center; width: 40px; }

        .fresh-node-trigger { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .fresh-dot-outer { 
          width: 34px; height: 34px; background: #fff; border: 2px solid #e2e8f0; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; transition: 0.3s;
        }
        .done .fresh-dot-outer { background: #10b981; border-color: #10b981; color: #fff; }
        .active .fresh-dot-outer { border-color: #fb923c; transform: scale(1.1); box-shadow: 0 0 0 4px rgba(251, 146, 60, 0.1); }
        .fresh-icon-check { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 3; }
        .fresh-dot-inner { width: 6px; height: 6px; background: #cbd5e1; border-radius: 50%; }

        .fresh-label-box { text-align: center; margin-top: 16px; width: 100px; }
        .fresh-node-label { display: block; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 2px; }
        .done .fresh-node-label { color: #1e293b; }
        .active .fresh-node-label { color: #fb923c; }
        .fresh-node-time { font-size: 10px; color: #94a3b8; }

        /* TOOLTIP DAY MODE */
        .fresh-tooltip { 
          position: absolute; bottom: 55px; opacity: 0; visibility: hidden; z-index: 50;
          transition: 0.2s ease-out; width: 220px;
        }
        .fresh-node-trigger:hover .fresh-tooltip { opacity: 1; visibility: visible; transform: translateY(-5px); }
        
        .fresh-tooltip.align-center { left: 50%; transform: translateX(-50%); }
        .fresh-tooltip.align-left { left: 0; transform: translateX(0); }
        .fresh-tooltip.align-right { right: 0; transform: translateX(0); }

        .fresh-tooltip-box {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }
        .fresh-tt-header { font-size: 9px; font-weight: 900; color: #fb923c; letter-spacing: 0.5px; margin-bottom: 6px; }
        .fresh-tt-body { font-size: 12px; color: #475569; margin: 0; line-height: 1.4; }
        .fresh-tt-footer { margin-top: 8px; padding-top: 8px; border-top: 1px dotted #e2e8f0; font-size: 10px; color: #94a3b8; }

        .fresh-tooltip-arrow { 
          position: absolute; bottom: -6px; border-left: 6px solid transparent; 
          border-right: 6px solid transparent; border-top: 6px solid #fff; 
        }
        .align-center .fresh-tooltip-arrow { left: 50%; transform: translateX(-50%); }
        .align-left .fresh-tooltip-arrow { left: 15px; }
        .align-right .fresh-tooltip-arrow { right: 15px; }

        .fresh-alert-dot { position: absolute; top: 2px; right: 2px; width: 8px; height: 8px; background: #fb923c; border: 2px solid #fff; border-radius: 50%; z-index: 4; }

        @keyframes fresh-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes saas-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        @media (max-width: 768px) {
          .fresh-saas-container { padding: 30px; }
          .fresh-header { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
      `}</style>
    </div>
  );
}