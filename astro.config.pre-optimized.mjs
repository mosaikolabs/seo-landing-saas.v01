import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Configuración mínima para producción
export default defineConfig({
  // Configuración del sitio para generación de URLs
  site: 'https://internationalpathfinders.com',
  base: '/saas-para-joyerias',
  
  // Configuración de salida
  output: 'static',
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true
  },
  
  // Integraciones
  integrations: [
    tailwind({
      config: {
        mode: 'jit',
        content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
      },
    })
  ],
  
  // Configuración de compilación
  build: {
    format: 'directory',
    inlineStylesheets: 'always'
  },
  
  // Configuración de Vite
  vite: {
    build: {
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[hash].js',
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash][extname]',
        },
      },
    },
    ssr: {
      noExternal: true
    }
  }
});
