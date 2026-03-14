import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    
  plugins: [react()],
  resolve: {
    alias: {
      // Esto es VITAL: permite que tus imports sigan funcionando
      // si usabas rutas relativas o absolutas
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Tu puerto de desarrollo
    proxy: {
      // Mantenemos la comunicación con tus funciones de Netlify
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});