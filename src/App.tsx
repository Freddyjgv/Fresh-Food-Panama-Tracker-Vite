import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./styles/globals.css";
import { LanguageProvider } from "@/lib/uiLanguage";

// --- CARGA DINÁMICA ---
// 1. Agregamos el Dashboard
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));

// 2. Renombramos o mantenemos el listado de embarques
const AdminShipmentsIndex = lazy(() => import('@/pages/admin/shipments/index'));
const AdminShipmentDetail = lazy(() => import('@/pages/admin/shipments/[id]'));

const AdminQuotesIndex = lazy(() => import('@/pages/admin/quotes/index'));
const AdminQuoteDetailPage = lazy(() => import('@/pages/admin/quotes/[id]'));

const AdminUsers = lazy(() => import('@/pages/admin/users/index'));
const AdminUserDetail = lazy(() => import('@/pages/admin/users/UserDetail'));

const ClientLogin = lazy(() => import('@/pages/login'));
const AdminLogin = lazy(() => import('@/pages/admin/login'));

const PageLoader = () => (
  <div className="opacity-0 animate-in fade-in duration-500">
    <div className="h-1 bg-emerald-500 w-full fixed top-0 left-0 z-50" />
  </div>
);

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<ClientLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* --- DASHBOARD --- */}
            {/* Esta es la ruta para el archivo Dashboard.tsx */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* --- SHIPMENTS (Embarques) --- */}
            {/* Esta es la ruta para el index de embarques */}
            <Route path="/admin/shipments" element={<AdminShipmentsIndex />} />
            <Route path="/admin/shipments/:id" element={<AdminShipmentDetail />} />

            {/* --- QUOTES (Cotizaciones) --- */}
            <Route path="/admin/quotes" element={<AdminQuotesIndex />} />
            <Route path="/admin/quotes/:id" element={<AdminQuoteDetailPage />} />

            {/* --- USUARIOS / CLIENTES --- */}
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />

            {/* --- REDIRECCIONES --- */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Al entrar a /admin, mandamos al Dashboard por defecto */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* --- 404 --- */}
            <Route path="*" element={
              <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-4xl font-black text-slate-200">404</h1>
                <p className="text-slate-500 font-medium">La página no existe en el Directorio Maestro.</p>
                <button 
                  onClick={() => window.location.href='/admin/dashboard'}
                  className="mt-4 text-emerald-600 font-bold hover:underline"
                >
                  Regresar al Dashboard
                </button>
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>

      <style>{`
        .ff-loader-full {
          height: 100vh; width: 100vw;
          display: flex; align-items: center; justify-content: center;
          background: #f8fafc;
        }
      `}</style>
    </LanguageProvider>
  );
}