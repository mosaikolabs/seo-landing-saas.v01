# Optimización de Imágenes para SEO

Este documento explica cómo funciona el sistema de optimización de imágenes implementado en el proyecto y cómo usarlo efectivamente.

## Características Principales

- Conversión automática a formatos modernos (WebP/AVIF)
- Generación de imágenes responsivas
- Optimización de tamaño sin pérdida de calidad visible
- Soporte para metadatos EXIF
- Sistema de caché para compilaciones rápidas
- Integración con el proceso de construcción

## Requisitos Previos

- Node.js 16+
- npm o yarn
- Dependencias del proyecto instaladas (`npm install`)

## Configuración

La configuración se encuentra en `config/image-optimization.js`. Puedes personalizar:

- Formatos de salida
- Calidad de compresión
- Tamaños responsivos
- Directorios de entrada/salida
- Opciones avanzadas por formato

## Uso

### Optimizar imágenes manualmente

```bash
# Optimizar todas las imágenes
npm run optimize-images

# Modo simulación (no realiza cambios)
npm run optimize-images -- --dry-run

# Especificar directorios personalizados
npm run optimize-images -- --input=./src/assets --output=./public/img

# Generar solo formatos específicos
npm run optimize-images -- --formats=webp,avif

# Cambiar calidad (0-100)
npm run optimize-images -- --quality=90
```

### Optimización durante el desarrollo

Para optimizar automáticamente las imágenes cuando cambian:

```bash
npm run optimize-images:watch
```

### Integración con el flujo de trabajo

El comando `npm run build` ya incluye la optimización de imágenes automáticamente.

## Estructura de archivos

```
public/
  images/              # Imágenes originales (no versionadas)
    hero/
    products/
    ...
  optimized/           # Imágenes optimizadas (generadas automáticamente)
    images/
      hero/
        image-320w.webp
        image-640w.webp
        ...
      products/
```

## Mejores Prácticas

1. **Tamaño de archivo**: Las imágenes no deberían superar los 500KB.
2. **Dimensiones**: Usa el tamaño adecuado para cada dispositivo.
3. **Formatos**:
   - Usa WebP para compatibilidad general
   - Usa AVIF para imágenes de alta calidad cuando la compatibilidad no sea crítica
   - Mantén versiones JPEG como respaldo
4. **Lazy Loading**: Usa el atributo `loading="lazy"` para imágenes fuera del viewport.
5. **CDN**: Considera usar un CDN para servir imágenes optimizadas.

## Rendimiento

El sistema de caché evita reprocesar imágenes que no han cambiado, lo que acelera significativamente las compilaciones posteriores.

## Solución de Problemas

### Las imágenes no se están optimizando

1. Verifica que los directorios de entrada/salida sean correctos
2. Asegúrate de que las extensiones de archivo sean soportadas
3. Revisa los logs en busca de errores

### Tamaño de archivo más grande que el original

Esto puede pasar con imágenes pequeñas o ya optimizadas. Considera:

- Reducir la calidad
- Deshabilitar la optimización para imágenes específicas
- Usar formatos más eficientes

## Personalización

Puedes personalizar el comportamiento modificando el archivo `scripts/optimize-images.js` o la configuración en `config/image-optimization.js`.

## Licencia

Este proyecto está bajo la licencia ISC.
