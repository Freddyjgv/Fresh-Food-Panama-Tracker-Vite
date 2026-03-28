import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; 
import { supabase } from "../../../lib/supabaseClient";
import { getApiBase } from "../../../lib/apiBase";
import { ClientLayout } from "../../../components/ClientLayout";
import { ProgressStepper } from "../../../components/ProgressStepper";

import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  ArrowLeft, 
  Package, 
  MapPin, 
  CheckCircle2,
  FileCheck,
  ExternalLink,
  Loader2
} from "lucide-react";

/* =======================
   Types & Config
======================= */
type Milestone = { type: string; at: string; note?: string | null };
type FileItem = { id: string; filename: string; created_at: string; doc_type?: string | null; url?: string | null; };
type ShipmentDetail = {
  id: string; code: string; destination: string; incoterm?: string | null; status: string;
  created_at: string; client_name?: string | null; clients?: { name?: string | null } | null;
  client?: { name?: string | null } | null; product_name?: string | null; product_variety?: string | null;
  product_mode?: string | null; caliber?: string | null; color?: string | null;
  boxes?: number | null; pallets?: number | null; weight_kg?: number | null;
  flight_number?: string | null; awb?: string | null; milestones: Milestone[];
  documents: FileItem[]; photos: FileItem[]; flight_departure_time?: string | null;
  flight_arrival_time?: string | null; flight_status?: string | null; last_api_sync?: string | null;
};

const DOC_LABELS: Record<string, string> = {
  invoice: "Factura Comercial",
  packing_list: "Lista de Empaque",
  awb: "Guía Aérea (AWB)",
  phytosanitary: "Cert. Fitosanitario",
  eur1: "Certificado EUR.1",
  export_declaration: "DEX (Exportación)",
  non_recyclable_plastics: "Decl. Plásticos",
  sanitary_general_info: "Info. Sanitaria",
  additives_declaration: "Decl. Aditivos",
  quality_report: "Informe Calidad"
};

function clientNameLine(d: ShipmentDetail) {
  return String(d.client_name || d.clients?.name || d.client?.name || "").trim() || "—";
}

function productLine(d: ShipmentDetail) {
  const name = String(d.product_name || "").trim();
  const variety = String(d.product_variety || "").trim();
  const modeRaw = String(d.product_mode || "").trim();
  const mode = (() => {
    const s = modeRaw.toLowerCase();
    if (!s) return "";
    if (s.includes("aere") || s === "air") return "Aérea";
    if (s.includes("marit") || s === "sea") return "Marítima";
    return modeRaw;
  })();
  const left = [name, variety].filter(Boolean).join(" ");
  return [left, mode].filter(Boolean).join(" · ") || "—";
}

export default function ShipmentDetailPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [data, setData] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data?.photos || data.photos.length <= 1) return;
      if (e.key === "ArrowRight") setActivePhotoIdx((prev) => (prev + 1) % data.photos.length);
      else if (e.key === "ArrowLeft") setActivePhotoIdx((prev) => (prev - 1 + data.photos.length) % data.photos.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data?.photos]);

  async function load(shipmentId: string) {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { navigate("/login"); return; }
      const res = await fetch(`${getApiBase()}/.netlify/functions/getShipment?id=${encodeURIComponent(shipmentId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cargando embarque");
      const json = await res.json();
      setData(json);
    } catch (e) { console.error("Error en load:", e); } finally { setLoading(false); }
  }

  useEffect(() => { if (id) load(id); }, [id]);

  // FUNCIÓN 1: PREVISUALIZACIÓN (Abrir URL de Supabase directamente)
  async function handleView(fileId: string) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch(`${getApiBase()}/.netlify/functions/getDownloadUrl?fileId=${encodeURIComponent(fileId)}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const { url } = await res.json();
    window.open(url, "_blank");
  }

  // FUNCIÓN 2: DESCARGA REAL (Fetch a Blob para forzar descarga)
  async function handleDownload(fileId: string, filename: string) {
    setDownloadingId(fileId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch(`${getApiBase()}/.netlify/functions/getDownloadUrl?fileId=${encodeURIComponent(fileId)}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      const { url } = await res.json();
      
      const fileRes = await fetch(url);
      const blob = await fileRes.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error("Error downloading file:", e);
    } finally {
      setDownloadingId(null);
    }
  }

  const docCount = useMemo(() => {
    if (!data?.documents) return 0;
    const uniqueUploadedTypes = new Set(
      data.documents
        .filter(d => d.doc_type && Object.keys(DOC_LABELS).includes(d.doc_type))
        .map(d => d.doc_type)
    );
    return uniqueUploadedTypes.size;
  }, [data?.documents]);

  if (loading) return <ClientLayout title="Cargando..."><div className="ff-loader-view">Sincronizando expediente...</div></ClientLayout>;

  return (
    <ClientLayout title="Expediente Logístico" subtitle="Gestión de carga y documentación" wide>
      <div className="ff-detail-container">
        <div className="ff-nav-breadcrumb">
          <Link to="/clients/shipments" className="ff-back-link">
            <ArrowLeft size={14} /> Volver al listado
          </Link>
        </div>

        {data && (
          <div className="ff-detail-content">
            <header className="ff-header-premium">
              <div className="ff-header-main-info">
                <div className="ff-id-badge">
                  <Package size={14} />
                  <span>REF: {data.code}</span>
                </div>
                <h1 className="ff-product-name">{productLine(data)}</h1>
                <div className="ff-client-tag">Consignatario: <strong>{clientNameLine(data)}</strong></div>
              </div>

              <div className="ff-header-specs-bar">
                <div className="ff-spec-item">
                  <span className="ff-spec-label">DESTINO</span>
                  <div className="ff-spec-value-group">
                    <MapPin size={12} />
                    <span className="ff-spec-value">{data.destination}</span>
                  </div>
                </div>
                <div className="ff-spec-divider"></div>
                <div className="ff-spec-item">
                  <span className="ff-spec-label">INCOTERM</span>
                  <span className="ff-spec-value text-green">{data.incoterm || 'FOB'}</span>
                </div>
                <div className="ff-spec-divider-heavy"></div>
                <div className="ff-spec-item">
                  <span className="ff-spec-label">CAJAS / PLTS</span>
                  <span className="ff-spec-value">{data.boxes || '0'} / {data.pallets || '0'}</span>
                </div>
              </div>
            </header>

            <section className="ff-section-card ff-stepper-section">
              <ProgressStepper 
                milestones={data.milestones ?? []} 
                flightNumber={data.flight_number ?? null} 
                awb={data.awb ?? null}
                flightStatus={data.flight_status}
                departureTime={data.flight_departure_time}
                arrivalTime={data.flight_arrival_time}
              />
            </section>

            <div className="ff-grid-50-50">
              {/* REPORTE FOTOGRÁFICO */}
              <section className="ff-section-card no-padding overflow-hidden">
                <div className="ff-card-header-inner">
                  <div className="header-icon orange"><ImageIcon size={18} /></div>
                  <h3>Reporte Fotográfico</h3>
                </div>
                
                <div className="ff-gallery-box">
                  {data?.photos && data.photos.length > 0 ? (
                    <>
                      <div className="ff-main-photo-wrapper" onClick={() => handleView(data.photos[activePhotoIdx]?.id)}>
                         <img src={data.photos[activePhotoIdx]?.url || ''} alt="Inspección" />
                         <div className="ff-photo-counter">{activePhotoIdx + 1} / {data.photos.length}</div>
                      </div>
                      <div className="ff-thumbs-strip">
                        {data.photos.map((p, idx) => (
                          <div key={p.id || idx} className={`ff-thumb ${idx === activePhotoIdx ? 'active' : ''}`} onClick={() => setActivePhotoIdx(idx)}>
                            <img src={p.url || ''} alt="thumb" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="ff-no-photos-placeholder"><p>Cargando inspección...</p></div>
                  )}
                </div>
              </section>

              {/* REPOSITORIO DOCUMENTAL */}
              <section className="ff-section-card no-padding overflow-hidden">
                <div className="ff-card-header-inner spread">
                  <div className="ff-header-group">
                    <div className="header-icon dark"><FileCheck size={18} /></div>
                    <h3>Documentación</h3>
                  </div>
                  <div className="doc-counter-pro">
                    <span>{docCount}</span><span className="total">/10</span>
                  </div>
                </div>

                <div className="ff-fm-compact-list">
                  {Object.entries(DOC_LABELS).map(([key, label]) => {
                    const doc = data.documents?.find(d => d.doc_type === key);
                    const isUp = !!doc;
                    return (
                      <div key={key} className={`ff-fm-row ${isUp ? 'is-up' : 'is-off'}`}>
                        <div className="ff-fm-name">
                          <FileText size={14} className="ff-fm-icon" />
                          <span>{label}</span>
                        </div>
                        
                        <div className="ff-fm-actions">
                          {isUp ? (
                            <div className="ff-btn-group">
                              <button className="ff-action-btn view" onClick={() => handleView(doc.id)} title="Previsualizar">
                                <ExternalLink size={13} />
                              </button>
                              <button 
                                className="ff-action-btn download" 
                                onClick={() => handleDownload(doc.id, doc.filename)} 
                                disabled={downloadingId === doc.id}
                                title="Descargar"
                              >
                                {downloadingId === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                              </button>
                            </div>
                          ) : (
                            <span className="ff-fm-status">Pendiente</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ff-detail-container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 0 40px 40px; 
          box-sizing: border-box; 
        }
        .ff-nav-breadcrumb { margin-top: 25px; margin-bottom: 20px; }
        .ff-back-link { 
          display: inline-flex; align-items: center; gap: 6px; 
          color: #64748b; font-size: 13px; font-weight: 700; 
          text-decoration: none; transition: 0.2s;
        }
        .ff-back-link:hover { color: #284b2c; transform: translateX(-2px); }
        
        .ff-detail-content { display: flex; flex-direction: column; gap: 24px; }
        .ff-section-card { background: white; border-radius: 16px; border: 1px solid #eef2f6; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .ff-section-card.no-padding { padding: 0; }

        .ff-card-header-inner { padding: 18px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f8fafc; }
        .ff-card-header-inner.spread { justify-content: space-between; }
        .ff-card-header-inner h3 { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.02em; }

        .ff-grid-50-50 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }

        .ff-header-premium { background: white; padding: 25px 30px; border-radius: 20px; border: 1px solid #eef2f6; display: flex; align-items: center; justify-content: space-between; }
        .ff-id-badge { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; color: #166534; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-weight: 700; font-size: 12px; margin-bottom: 8px; }
        .ff-product-name { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.1; }
        .ff-client-tag { color: #64748b; margin-top: 4px; font-size: 13px; }

        .ff-header-specs-bar { display: flex; align-items: center; gap: 20px; background: #f8fafc; padding: 12px 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
        .ff-spec-item { display: flex; flex-direction: column; gap: 2px; }
        .ff-spec-label { font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
        .ff-spec-value { font-size: 13px; font-weight: 700; color: #1e293b; }
        .ff-spec-divider { width: 1px; height: 24px; background: #e2e8f0; }

        .ff-gallery-box { padding: 20px; }
        .ff-main-photo-wrapper { width: 100%; aspect-ratio: 16/9; background: #f8fafc; border-radius: 12px; overflow: hidden; margin-bottom: 12px; position: relative; border: 1px solid #f1f5f9; cursor: zoom-in; }
        .ff-main-photo-wrapper img { width: 100%; height: 100%; object-fit: contain; }
        .ff-photo-counter { position: absolute; bottom: 10px; right: 10px; background: rgba(15, 23, 42, 0.8); color: white; padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .ff-thumbs-strip { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
        .ff-thumb { width: 50px; height: 50px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; transition: 0.2s; }
        .ff-thumb.active { border-color: #284b2c; transform: translateY(-2px); }
        .ff-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }

        .ff-fm-compact-list { padding: 10px 20px 20px; }
        .ff-fm-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; border-bottom: 1px solid #f8fafc; transition: 0.2s; border-radius: 6px; }
        .ff-fm-row.is-off { opacity: 0.5; }
        .ff-fm-row:hover { background: #f8fafc; }
        .ff-fm-name { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ff-fm-icon { color: #94a3b8; flex-shrink: 0; }
        .is-up .ff-fm-icon { color: #284b2c; }
        
        .ff-btn-group { display: flex; gap: 4px; }
        .ff-action-btn { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .ff-action-btn:hover { border-color: #284b2c; color: #284b2c; background: #f0fdf4; }
        .ff-action-btn.view:hover { border-color: #0284c7; color: #0284c7; background: #f0f9ff; }
        .ff-fm-status { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; padding-right: 5px; }

        .doc-counter-pro { display: flex; align-items: center; background: #0f172a; color: white; padding: 3px 10px; border-radius: 20px; font-weight: 800; font-size: 11px; }
        .doc-counter-pro .total { opacity: 0.4; margin-left: 1px; }

        .header-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .header-icon.orange { background: #fff7ed; color: #ea580c; }
        .header-icon.dark { background: #f1f5f9; color: #0f172a; }

        @media (max-width: 1100px) { 
          .ff-grid-50-50 { grid-template-columns: 1fr; } 
          .ff-detail-container { padding: 0 20px 20px; }
        }
      ` }} />
    </ClientLayout>
  );
}