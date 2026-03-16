import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getApiBase } from "../lib/apiBase";
import { useUILang } from "../lib/uiLanguage";
import { 
  Package, Globe, ChevronDown, LogOut, Search, Loader2,
  UserCircle2, FileText, Users, ArrowRight, Ship, User
} from "lucide-react";

const LOGO_SRC = "/brand/freshfood-logo.svg";

type Me = { email: string | null; role: string | null; loading: boolean };
type SearchResult = { id: string; type: 'shipment' | 'quote' | 'user'; label: string; sub: string };

export function ClientLayout({
  title,
  subtitle,
  children,
  wide = true,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggle } = useUILang();

  const [me, setMe] = useState<Me>({ email: null, role: null, loading: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const nav = useMemo(() => [
    { href: "/admin/shipments", label: lang === "es" ? "Embarques" : "Shipments", icon: Package },
    { href: "/admin/quotes", label: lang === "es" ? "Cotizaciones" : "Quotes", icon: FileText },
    { href: "/admin/users", label: lang === "es" ? "Directorio" : "Directory", icon: Users },
  ], [lang]);

  const handleGlobalSearch = async (val: string) => {
    setGlobalQuery(val);
    if (val.length < 2) { setSearchResults([]); return; }
    
    setIsSearching(true);
    try {
      // 360 Search: Embarques, Cotizaciones y Usuarios
      const [shipRes, quoteRes, userRes] = await Promise.all([
        supabase.from('shipments').select('id, file_number, client_name').ilike('file_number', `%${val}%`).limit(2),
        supabase.from('quotes').select('id, quote_number, client_name').ilike('quote_number', `%${val}%`).limit(2),
        supabase.from('profiles').select('id, full_name, email').ilike('full_name', `%${val}%`).limit(2)
      ]);

      const formatted: SearchResult[] = [
        ...(shipRes.data || []).map(s => ({ id: s.id, type: 'shipment' as const, label: s.file_number, sub: s.client_name })),
        ...(quoteRes.data || []).map(q => ({ id: q.id, type: 'quote' as const, label: q.quote_number, sub: q.client_name })),
        ...(userRes.data || []).map(u => ({ id: u.id, type: 'user' as const, label: u.full_name, sub: u.email }))
      ];
      setSearchResults(formatted);
    } catch (e) {
      console.error("Search error", e);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setGlobalQuery("");
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate("/login"); return; }
      try {
        const res = await fetch(`${getApiBase()}/.netlify/functions/getMyProfile`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const json = await res.json();
        if (mounted) setMe({ email: json.email, role: json.role, loading: false });
      } catch { if (mounted) setMe(prev => ({ ...prev, loading: false })); }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div className="ff-app">
      <header className="ff-top">
        <div className="ff-top__inner">
          <div className="ff-top__left">
            <img src={LOGO_SRC} alt="Logo" width={32} height={32} className="ff-top__logo" style={{cursor:'pointer'}} onClick={() => navigate('/admin/shipments')} />
            
            <div className="ff-search-container" ref={searchRef}>
              <div className={`ff-search-box ${globalQuery ? 'is-active' : ''}`}>
                <Search size={16} className="ff-search-icon" />
                <input 
                  placeholder={lang === 'es' ? "Buscar ID, Cliente o Usuario..." : "Search ID, Client or User..."}
                  value={globalQuery}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                />
                {isSearching && <Loader2 size={14} className="ff-spin" />}
              </div>
              
              {globalQuery.length >= 2 && (
                <div className="ff-search-dropdown animate-fade-in">
                  {searchResults.length > 0 ? searchResults.map(res => (
                    <button key={res.id} className="ff-search-item" onClick={() => {
                      const path = res.type === 'shipment' ? 'shipments' : res.type === 'quote' ? 'quotes' : 'users';
                      navigate(`/admin/${path}/${res.id}`);
                      setGlobalQuery("");
                    }}>
                      <div className={`res-icon ${res.type}`}>
                        {res.type === 'shipment' ? <Ship size={12}/> : res.type === 'quote' ? <FileText size={12}/> : <User size={12}/>}
                      </div>
                      <div className="res-content">
                        <span className="res-title">{res.label || 'S/N'}</span>
                        <span className="res-sub">{res.sub || 'N/A'}</span>
                      </div>
                      <ArrowRight size={14} className="res-arrow" />
                    </button>
                  )) : !isSearching && <div className="ff-search-empty">Sin resultados</div>}
                </div>
              )}
            </div>
          </div>

          <div className="ff-top__right">
            <button type="button" className="ff-chip-lang" onClick={toggle}>
              <Globe size={14} /> <span>{lang.toUpperCase()}</span>
            </button>

            <div className="ff-user" ref={menuRef}>
              <button type="button" className="ff-user__btn" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="ff-user__avatar">{me.email?.charAt(0).toUpperCase() || <UserCircle2 size={16}/>}</div>
                <span className="ff-user__email">{me.loading ? '...' : me.email?.split('@')[0]}</span>
                <ChevronDown size={14} className={menuOpen ? 'rotate' : ''} />
              </button>
              {menuOpen && (
                <div className="ff-user__menu animate-fade-in">
                  <div className="ff-user__header">
                    <p className="ff-user__metaEmail">{me.email}</p>
                    <p className="ff-user__metaRole">{me.role?.toUpperCase() || 'STAFF'}</p>
                  </div>
                  <div className="ff-user__sep" />
                  <button className="ff-user__item" onClick={() => navigate("/profile")}><UserCircle2 size={16} /><span>Perfil</span></button>
                  <button className="ff-user__item danger" onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}>
                    <LogOut size={16} /><span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <aside className="ff-side">
        <nav className="ff-side__nav">
          {nav.map((n) => {
            const Icon = n.icon;
            const isActive = location.pathname.startsWith(n.href);
            return (
              <Link key={n.href} to={n.href} className={`ff-side__item ${isActive ? "is-active" : ""}`}>
                <Icon size={18} />
                <span>{n.label}</span>
                {isActive && <div className="ff-side__active-line" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="ff-main">
        <div className={`ff-content ${wide ? "ff-content--wide" : ""}`}>{children}</div>
      </main>

      <style>{`
        .ff-app { display: grid; grid-template-areas: "top top" "side main"; grid-template-columns: 240px 1fr; grid-template-rows: 64px 1fr; height: 100vh; font-family: sans-serif; }
        .ff-top { grid-area: top; background: white; border-bottom: 1px solid #f1f5f9; padding: 0 24px; z-index: 100; }
        .ff-top__inner { height: 100%; display: flex; align-items: center; justify-content: space-between; }
        .ff-top__left { display: flex; align-items: center; gap: 20px; flex: 1; }
        
        .ff-search-container { position: relative; width: 100%; max-width: 400px; }
        .ff-search-box { display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 12px; transition: 0.2s; }
        .ff-search-box:focus-within { background: white; border-color: #94a3b8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .ff-search-box input { border: none; background: none; outline: none; padding: 10px; font-size: 13px; width: 100%; }
        
        .ff-search-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 200; overflow: hidden; }
        .ff-search-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: none; cursor: pointer; border-bottom: 1px solid #f8fafc; }
        .ff-search-item:hover { background: #f8fafc; }
        
        .res-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .res-icon.shipment { background: #eff6ff; color: #3b82f6; }
        .res-icon.quote { background: #f0fdf4; color: #22c55e; }
        .res-icon.user { background: #fef2f2; color: #ef4444; }
        .res-content { flex: 1; text-align: left; }
        .res-title { display: block; font-size: 13px; font-weight: 700; color: #1e293b; }
        .res-sub { font-size: 11px; color: #94a3b8; }

        .ff-side { grid-area: side; background: white; border-right: 1px solid #f1f5f9; padding: 20px 12px; }
        .ff-side__item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #64748b; text-decoration: none; border-radius: 10px; font-size: 14px; margin-bottom: 4px; position: relative; }
        .ff-side__item.is-active { background: #f1f5f9; color: #0f172a; font-weight: 700; }
        .ff-side__active-line { position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px; background: #0f172a; border-radius: 0 4px 4px 0; }
        
        .ff-user__avatar { width: 28px; height: 28px; background: #0f172a; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .ff-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}