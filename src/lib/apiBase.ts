export function getApiBase(): string {
  // 1. Intenta leer la variable de entorno de Vite
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) return envUrl;

  // 2. Si no hay variable, usamos un fallback inteligente
  // Si estamos en localhost, usualmente Netlify Functions corre en el 8888
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8888';
  }

  // 3. En producción, si la API está en el mismo dominio, basta con un string vacío
  // Pero para evitar errores de concatenación, es mejor devolver el origen actual
  return window.location.origin;
}