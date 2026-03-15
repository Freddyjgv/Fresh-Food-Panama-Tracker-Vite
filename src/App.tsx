import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";
import "./styles/globals.css";
import { LanguageProvider } from "@/lib/uiLanguage";

// --- COMPONENTE DE PROTECCIÓN DE RUTAS ---
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: 'admin' | 'client' }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // 1. Obtener sesión de forma persistente
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (isMounted) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 2. Consultar perfil con manejo de error para evitar bucle 500
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle(); // maybeSingle evita errores si no encuentra nada inmediatamente

        if (isMounted) {
          if (error || !profile) {
            console.error("Error de perfil o acceso denegado:", error);
            setAuthorized(false);
          } else if (requiredRole && profile.role !== requiredRole) {
            setAuthorized(false);
          } else {
            setAuthorized(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Fallo crítico en Auth:", err);
        if (isMounted) {
          setAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [location.pathname, requiredRole]); // Escuchamos cambios de ruta para re-validar

  if (loading) {
    return (
      <div className="ff-loader-full flex flex-col gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
        <p className="text-sm font-medium text-slate-500">Verificando sesión...</p>
      </div>
    );
  }

  if (!authorized) {
    // Si no está autorizado y no estamos ya en login, redirigir
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// --- COMPONENTES DE CARGA ---
const PageLoader = () => (
  <div className="ff-loader-full">
    <div className="h-1 bg-emerald-500 w-full fixed top-0 left-0 z-50 animate-pulse" />
  </div>
);

// --- CARGA DINÁMICA ---
const ClientShipments = lazy(() => import('./pages/shipments/ShipmentsPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminLogin = lazy(() => import('@/pages/admin/login'));
const ClientLogin = lazy(() => import('@/pages/login'));
const AdminShipmentsIndex = lazy(() => import('@/pages/admin/shipments/index'));
const AdminShipmentDetail = lazy(() => import('@/pages/admin/shipments/[id]'));
const AdminQuotesIndex = lazy(() => import('@/pages/admin/quotes/index'));
const AdminQuoteDetailPage = lazy(() => import('@/pages/admin/quotes/[id]'));
const AdminUsers = lazy(() => import('@/pages/admin/users/index'));
const AdminUserDetail = lazy(() => import('@/pages/admin/users/UserDetail'));

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- RUTAS PÚBLICAS --- */}
            <Route path="/login" element={<ClientLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* --- PANEL DE CLIENTES --- */}
            <Route 
              path="/shipments" 
              element={
                <ProtectedRoute requiredRole="client">
                  <ClientShipments />
                </ProtectedRoute>
              } 
            />

            {/* --- RUTAS ADMINISTRATIVAS --- */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/shipments" element={<ProtectedRoute requiredRole="admin"><AdminShipmentsIndex /></ProtectedRoute>} />
            <Route path="/admin/shipments/:id" element={<ProtectedRoute requiredRole="admin"><AdminShipmentDetail /></ProtectedRoute>} />
            <Route path="/admin/quotes" element={<ProtectedRoute requiredRole="admin"><AdminQuotesIndex /></ProtectedRoute>} />
            <Route path="/admin/quotes/:id" element={<ProtectedRoute requiredRole="admin"><AdminQuoteDetailPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute requiredRole="admin"><AdminUserDetail /></ProtectedRoute>} />

            {/* --- REDIRECCIONES --- */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* --- 404 --- */}
            <Route path="*" element={
              <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-4xl font-black text-slate-200">404</h1>
                <p className="text-slate-500 font-medium">La página no existe.</p>
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>

      <style>{`
        .ff-loader-full {
          height: 100vh; width: 100vw;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #f8fafc;
        }
      `}</style>
    </LanguageProvider>
  );
}