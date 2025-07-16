import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Configuración básica del sitio
  site: 'http://localhost:3000',
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: true,
    open: true
  },
  
  // Integraciones
  integrations: [
    tailwind()
  ],
  
  // Configuración de Markdown
  markdown: {
    // Habilitar sintaxis de GitHub Flavored Markdown
    gfm: true,
    // Resaltado de sintaxis
    syntaxHighlight: 'shiki',
    // Configuración de Shiki (tema para el resaltado de código)
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  
  // Configuración de redirecciones
  redirects: {
    // Redirecciones permanentes (301)
    '/old-url': '/new-url',
    // Redirecciones temporales (302)
    '/temporary': { status: 302, destination: '/new-location' },
  },
  
  // Configuración de internacionalización (i18n)
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'fr']
  }
});
