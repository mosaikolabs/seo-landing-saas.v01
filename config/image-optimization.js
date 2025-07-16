/**
 * Configuración de optimización de imágenes
 * 
 * Este archivo contiene la configuración para el script de optimización de imágenes.
 * Puedes personalizar las opciones según las necesidades de tu proyecto.
 */

module.exports = {
  // Directorio de entrada de las imágenes
  input: './public/images',
  
  // Directorio de salida para las imágenes optimizadas
  output: './public/optimized',
  
  // Formatos de salida a generar (webp, avif, jpg, png)
  formats: ['webp', 'avif'],
  
  // Calidad de compresión (0-100)
  quality: 80,
  
  // Anchos responsivos a generar (en píxeles)
  widths: [320, 640, 1024, 1440, 1920],
  
  // Omitir archivos ya procesados
  skipExisting: true,
  
  // Mostrar logs detallados
  verbose: true,
  
  // Ejecutar sin realizar cambios (modo simulación)
  dryRun: false,
  
  // Opciones avanzadas de optimización
  optimization: {
    // Configuración específica para WebP
    webp: {
      effort: 6,        // Nivel de compresión (0-6)
      quality: 80,      // Calidad (0-100)
      alphaQuality: 80, // Calidad para canales con transparencia
      lossless: false,  // Usar compresión sin pérdida
      nearLossless: 60, // Compresión casi sin pérdida (0-100)
      smartSubsample: true,
      reductionEffort: 6,
    },
    
    // Configuración específica para AVIF
    avif: {
      effort: 5,        // Nivel de compresión (0-9)
      quality: 60,      // Calidad (0-100)
      lossless: false,  // Usar compresión sin pérdida
      chromaSubsampling: '4:2:0',
    },
    
    // Configuración específica para JPEG
    jpeg: {
      quality: 80,
      mozjpeg: true,    // Usar optimizaciones de MozJPEG
      progressive: true, // Imágenes progresivas
      trellisQuantisation: true,
      overshootDeringing: true,
      optimiseScans: true,
    },
    
    // Configuración específica para PNG
    png: {
      quality: 80,
      compressionLevel: 9, // Nivel de compresión (0-9)
      progressive: true,  // Imágenes progresivas
      palette: true,      // Reducir a paleta de colores
    },
    
    // Configuración específica para SVG
    svg: {
      plugins: [
        { removeViewBox: false }, // Mantener viewBox
        { cleanupIDs: false },    // Mantener IDs para referencias CSS/JS
        { removeDimensions: true }, // Eliminar width/height si hay viewBox
      ],
    },
  },
  
  // Excluir directorios o archivos específicos
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/original/**',   // Directorio para imágenes originales
    '**/unoptimized/**', // Directorio para imágenes sin optimizar
  ],
  
  // Configuración de caché
  cache: {
    enabled: true,      // Habilitar caché para acelerar compilaciones posteriores
    directory: './.cache/image-optimization',
  },
  
  // Configuración de metadatos
  metadata: {
    // Mantener metadatos EXIF (solo para formatos que los soporten)
    keepMetadata: {
      copyright: true,
      creation: true,
      location: false, // Por privacidad, deshabilitar datos de ubicación
      exif: true,
    },
  },
  
  // Configuración de CDN (opcional, para subir a un CDN después de la optimización)
  cdn: {
    enabled: false,
    provider: 'aws-s3', // Posibles valores: aws-s3, cloudinary, imgix, etc.
    // ... otras configuraciones específicas del proveedor
  },
  
  // Hooks personalizados
  hooks: {
    // Se ejecuta antes de procesar cada imagen
    beforeProcess: async (filePath) => {
      console.log(`Procesando: ${filePath}`);
    },
    
    // Se ejecuta después de procesar cada imagen exitosamente
    afterProcess: async (result) => {
      if (result.saved > 0) {
        console.log(`  ✓ Ahorro: ${result.saved}% (${(result.originalSize / 1024).toFixed(1)}KB → ${(result.optimizedSize / 1024).toFixed(1)}KB)`);
      }
    },
    
    // Se ejecuta cuando ocurre un error al procesar una imagen
    onError: async (error, filePath) => {
      console.error(`Error procesando ${filePath}:`, error.message);
    },
  },
};
