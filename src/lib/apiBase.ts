/**
 * Base URL para las funciones de Netlify.
 *
 * - Localhost (dev): usa "" (rutas relativas). Next.js hace proxy a Netlify vía rewrites,
 *   así evitamos CORS. Configurar NEXT_PUBLIC_NETLIFY_URL en .env.local para el proxy.
 *
 * - Deploy (producción o preview): usa "" para rutas relativas (mismo origen).
 *   IMPORTANTE: NO definir NEXT_PUBLIC_NETLIFY_URL en las variables de Netlify.
 */
export function getApiBase(): string {
  return "";
}
