import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getApiBase } from "../lib/apiBase";
import { useUILang } from "../lib/uiLanguage";
import {
  LayoutGrid, Package, Users, Globe, ChevronDown, LogOut, Search, Loader2,
  UserCircle2, FileText, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ArrowRight, Ship
} from "lucide-react";

const LOGO_SRC = "/brand/freshfood-logo.svg";
const LS_KEY = "ff_admin_sidebar_collapsed";

export let notify: (msg: string, type?: 'success' | 'error') => void = () => {};

type SearchResult = { 
  id: string; 
  type: 'shipment' | 'quote' | 'user'; 
  label: string; 
  sub: string;
  status?: string; 
};

export function AdminLayout({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode; }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggle } = useUILang();
  
  const [me, setMe] = useState<{ email: string | null; role: string | null }>({ email: null, role: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- REPARACIÓN DE NAV.MAP ---
  const nav = useMemo(() => [
  { 
    href: "/admin/dashboard", // Cambia de /admin a /admin/dashboard
    label: lang === "es" ? "Dashboard" : "Dashboard", 
    icon: LayoutGrid 
  },
  { 
    href: "/admin/shipments", 
    label: lang === "es" ? "Embarques" : "Shipments", 
    icon: Package 
  },
  { 
    href: "/admin/quotes", 
    label: lang === "es" ? "Cotizaciones" : "Quotes", 
    icon: FileText 
  },
  { 
    href: "/admin/users", 
    label: lang === "es" ? "Clientes" : "Clients", 
    icon: Users 
  },
], [lang]);
  // --- LÓGICA DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") { setGlobalQuery(""); inputRef.current?.blur(); }
      
      if (searchResults.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === "Enter" && selectedIndex !== -1) {
          const res = searchResults[selectedIndex];
          navigate(`/admin/${res.type === 'shipment' ? 'shipments' : res.type === 'quote' ? 'quotes' : 'users'}/${res.id}`);
          setGlobalQuery("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchResults, selectedIndex, navigate]);

const handleGlobalSearch = async (val: string) => {
  setGlobalQuery(val);
  if (val.length < 2) { setSearchResults([]); return; }
  setIsSearching(true);
  setSelectedIndex(-1);

  try {
    const [shipRes, quoteRes, clientRes] = await Promise.all([
      // 1. EMBARQUES (Usando 'code' que es lo que tienes en SQL)
      supabase.from('shipments')
        .select('id, code, destination, status')
        .or(`code.ilike.%${val}%,destination.ilike.%${val}%,awb.ilike.%${val}%`)
        .limit(3),
      
      // 2. COTIZACIONES (Usando 'quote_number' que es lo que tienes en SQL)
      supabase.from('quotes')
        .select('id, quote_number, destination, status')
        .or(`quote_number.ilike.%${val}%,destination.ilike.%${val}%`)
        .limit(3),
      
      // 3. CLIENTES (Desde la vista v_clients_overview)
      supabase.from('v_clients_overview')
        .select('id, name, legal_name, contact_email, city')
        .or(`name.ilike.%${val}%,legal_name.ilike.%${val}%,contact_email.ilike.%${val}%,city.ilike.%${val}%`)
        .limit(5)
    ]);

    const formatted: SearchResult[] = [
      ...(shipRes.data || []).map(s => ({ 
        id: s.id, 
        type: 'shipment' as const, 
        label: s.code || 'Embarque', 
        sub: s.destination || 'Sin destino',
        status: s.status 
      })),
      ...(quoteRes.data || []).map(q => ({ 
        id: q.id, 
        type: 'quote' as const, 
        label: q.quote_number || 'Cotización', 
        sub: q.destination || 'Sin destino',
        status: q.status 
      })),
      ...(clientRes.data || []).map(c => ({ 
        id: c.id, 
        type: 'user' as const, 
        label: c.name || c.legal_name, 
        sub: `${c.city || ''} • ${c.contact_email || ''}`.replace(/^ • /, ''),
        status: null
      }))
    ];
    
    setSearchResults(formatted);
  } catch (e) { 
    console.error("Error en búsqueda:", e); 
  } finally { 
    setIsSearching(false); 
  }
};

  useEffect(() => {
    try { if (localStorage.getItem(LS_KEY) === "1") setSideCollapsed(true); } catch {}
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as any)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as any)) setGlobalQuery("");
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate("/login"); return; }
      const res = await fetch(`${getApiBase()}/.netlify/functions/getMyProfile`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setMe({ email: json.email ?? null, role: json.role ?? null });
      }
    })();
  }, [navigate]);

  return (
    <div className={`ff-app ${sideCollapsed ? "is-collapsed" : ""}`}>
      {toast && (
        <div className={`ff-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
          <span>{toast.msg}</span>
        </div>
      )}

      <header className="ff-top">
        <div className="ff-top__inner">
          <div className="ff-top__left">
            <img src={LOGO_SRC} alt="FF" width={40} height={40} className="ff-top__logo" onClick={() => navigate('/admin')} style={{cursor:'pointer'}} />
            <div className="ff-v-sep" style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 16px' }} />
            <div className="ff-top__titleWrap">
              {title && <h1 className="ff-top__title">{title}</h1>}
              {subtitle && <div className="ff-top__sub">{subtitle}</div>}
            </div>
          </div>

          <div className="ff-top__right">
            <div className="ff-global-search" ref={searchRef}>
              <div className={`ff-search-pill ${globalQuery ? 'has-val' : ''}`}>
                <Search size={16} className="ico-search-main" />
                <input 
                  ref={inputRef}
                  placeholder={lang === 'es' ? "Buscar... (/)" : "Search... (/)"}
                  value={globalQuery}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                />
                {isSearching ? <Loader2 size={14} className="ff-spin" /> : <kbd className="ff-kbd">/</kbd>}
              </div>
              
              {globalQuery.length >= 2 && (
  <div className="ff-search-results animate-fade-in">
    {searchResults.length > 0 ? searchResults.map((res, idx) => (
      <button 
        key={res.id} 
        className={`res-item ${selectedIndex === idx ? 'is-selected' : ''}`}
        onMouseEnter={() => setSelectedIndex(idx)}
        onClick={() => {
          // Lógica de navegación inteligente según el tipo de resultado
          let path = '';
          if (res.type === 'shipment') path = 'shipments';
          else if (res.type === 'quote') path = 'quotes';
          else if (res.type === 'user') path = 'users'; // Aquí es donde te lleva a la ficha del cliente

          navigate(`/admin/${path}/${res.id}`);
          setGlobalQuery(""); // Limpia el buscador después de navegar
        }}
      >
        <div className={`res-tag ${res.type}`}>
          {res.type === 'shipment' ? <Ship size={12}/> : res.type === 'quote' ? <FileText size={12}/> : <UserCircle2 size={12}/>}
        </div>
        <div className="res-txt">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="res-title">{res.label}</span>
            {res.status && (
              <span className={`res-status-badge ${res.status.toLowerCase().replace(/\s/g, '-')}`}>
                {res.status}
              </span>
            )}
          </div>
          <span className="res-sub">{res.sub}</span>
        </div>
        <ArrowRight size={14} className="res-arr" />
      </button>
    )) : !isSearching && <div className="res-empty">Sin resultados</div>}
  </div>
)}
            </div>

            <button type="button" className="ff-chip" onClick={toggle}>
              <Globe size={14} /> <span>{lang.toUpperCase()}</span>
            </button>

            <div className="ff-user" ref={menuRef}>
              <button type="button" className="ff-user__btn" onClick={() => setMenuOpen(!menuOpen)}>
                <UserCircle2 size={16} />
                <span className="ff-user__email">{me.email?.split('@')[0] ?? "Usuario"}</span>
                <ChevronDown size={14} className={menuOpen ? 'rotate' : ''} />
              </button>
              {menuOpen && (
                <div className="ff-user__menu animate-fade-in">
                  <div className="ff-user__meta">
                    <div className="ff-user__metaEmail">{me.email ?? "-"}</div>
                    <div className="ff-user__metaRole">{lang === "es" ? "Rol" : "Role"}: <b>{me.role}</b></div>
                  </div>
                  <div className="ff-user__sep" />
                  <button type="button" className="ff-user__item" onClick={() => navigate("/admin/profile")}>
                    <UserCircle2 size={16} /> <span>Perfil</span>
                  </button>
                  <button type="button" className="ff-user__item danger" onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}>
                    <LogOut size={16} /> <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <aside className="ff-side">
        <button type="button" className="ff-side__toggle" onClick={() => setSideCollapsed(!sideCollapsed)}>
          {sideCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <nav className="ff-side__nav">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = location.pathname === n.href || (n.href !== "/admin" && location.pathname.startsWith(n.href));
            return (
              <Link key={n.href} to={n.href} className={`ff-side__item ${active ? "is-active" : ""}`}>
                <span className="ff-side__ico"><Icon size={16} /></span>
                <span className="ff-side__lbl">{n.label}</span>
                {active && <div className="ff-active-indicator" style={{ position: 'absolute', left: 0, top: '10px', bottom: '10px', width: '3px', background: '#0f172a', borderRadius: '0 4px 4px 0' }} />}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="ff-main"><main className="ff-content">{children}</main></div>

      <style>{`
        .ff-top { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); border-bottom: 1px solid #eef2f6; position: sticky; top: 0; z-index: 100; }
        .ff-top__inner { display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 24px; }
        .ff-top__right { display: flex; align-items: center; gap: 12px; }

        .ff-global-search { position: relative; width: 220px; transition: width 0.3s ease; }
        .ff-global-search:focus-within { width: 300px; }
        .ff-search-pill { display: flex; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 10px; height: 36px; }
        .ff-search-pill input { border: none; background: none; outline: none; padding: 0 8px; font-size: 13px; width: 100%; }
        .ff-kbd { background: white; border: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; padding: 1px 5px; border-radius: 4px; font-weight: 700; }

        .ff-search-results { position: absolute; top: 115%; right: 0; width: 320px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .res-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 15px; border: none; background: none; cursor: pointer; border-bottom: 1px solid #f8fafc; }
        .res-item.is-selected { background: #f1f5f9; }
        .res-status-badge { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; background: #f1f5f9; color: #64748b; }
        .res-status-badge.entregado, .res-status-badge.aprobado { background: #dcfce7; color: #15803d; }
        .res-tag { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .res-tag.shipment { background: #eff6ff; color: #3b82f6; }
        .res-tag.quote { background: #f0fdf4; color: #22c55e; }
        .res-title { font-size: 12px; font-weight: 700; color: #1e293b; }
        .res-sub { font-size: 10px; color: #94a3b8; display: block; text-align: left; }

        .ff-user__btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; color: #475569; font-weight: 600; font-size: 13px; }
        .rotate { transform: rotate(180deg); transition: 0.2s; }
        .ff-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}