#!/usr/bin/env node

/**
 * Script para optimizar imágenes en el proyecto
 * 
 * Características:
 * - Convierte imágenes a formatos modernos (WebP/AVIF)
 * - Genera versiones responsivas
 * - Optimiza el tamaño del archivo
 * - Mantiene los metadatos EXIF necesarios
 * 
 * Uso: node scripts/optimize-images.js [--input=./ruta/origen] [--output=./ruta/destino] [--formats=webp,avif]
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { program } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSvgo from 'imagemin-svgo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración por defecto
const DEFAULT_CONFIG = {
  input: './public/images',          // Directorio de origen de las imágenes
  output: './public/optimized',      // Directorio de salida para las imágenes optimizadas
  formats: ['webp', 'avif'],         // Formatos a generar
  quality: 80,                       // Calidad de compresión (0-100)
  widths: [320, 640, 1024, 1440, 1920], // Tamaños responsivos a generar
  skipExisting: true,                // Omitir archivos ya procesados
  verbose: true,                     // Mostrar logs detallados
  dryRun: false,                     // Ejecutar sin realizar cambios
};

// Inicializar Commander
program
  .option('-i, --input <path>', 'Directorio de origen de las imágenes', DEFAULT_CONFIG.input)
  .option('-o, --output <path>', 'Directorio de salida para las imágenes optimizadas', DEFAULT_CONFIG.output)
  .option('-f, --formats <formats>', 'Formatos a generar (ej: webp,avif,jpg)', DEFAULT_CONFIG.formats.join(','))
  .option('-q, --quality <number>', 'Calidad de compresión (0-100)', String(DEFAULT_CONFIG.quality))
  .option('--widths <widths>', 'Anchos responsivos (ej: 320,640,1024)', DEFAULT_CONFIG.widths.join(','))
  .option('--skip-existing', 'Omitir archivos ya procesados', DEFAULT_CONFIG.skipExisting)
  .option('--verbose', 'Mostrar logs detallados', DEFAULT_CONFIG.verbose)
  .option('--dry-run', 'Ejecutar sin realizar cambios', DEFAULT_CONFIG.dryRun)
  .parse(process.argv);

// Obtener opciones de la línea de comandos
const options = {
  ...DEFAULT_CONFIG,
  input: program.opts().input,
  output: program.opts().output,
  formats: program.opts().formats.split(',').map(f => f.trim().toLowerCase()),
  quality: parseInt(program.opts().quality, 10),
  widths: program.opts().widths.split(',').map(w => parseInt(w.trim(), 10)),
  skipExisting: program.opts().skipExisting,
  verbose: program.opts().verbose,
  dryRun: program.opts().dryRun,
};

// Validar opciones
if (options.quality < 0 || options.quality > 100) {
  console.error(chalk.red('Error: La calidad debe estar entre 0 y 100'));
  process.exit(1);
}

// Crear directorio de salida si no existe
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// Obtener estadísticas del archivo
async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime,
    };
  } catch (err) {
    return null;
  }
}

// Optimizar imagen con Sharp
async function optimizeImage(inputPath, outputPath, format, width, quality) {
  const outputFile = outputPath.replace(/\.(jpg|jpeg|png|gif|svg)$/i, `-${width}w.${format}`);
  
  // Verificar si el archivo ya existe
  if (options.skipExisting) {
    try {
      await fs.access(outputFile);
      if (options.verbose) {
        console.log(chalk.yellow(`  ✓ Ya existe: ${path.basename(outputFile)}`));
      }
      return { skipped: true };
    } catch (err) {
      // El archivo no existe, continuar con la optimización
    }
  }

  try {
    // Crear transformación con Sharp
    let pipeline = sharp(inputPath).rotate(); // Corrige la orientación EXIF
    
    // Redimensionar si se especifica un ancho
    if (width) {
      pipeline = pipeline.resize({
        width,
        withoutEnlargement: true, // No agrandar imágenes más pequeñas
        fit: 'inside',           // Mantener relación de aspecto
      });
    }

    // Aplicar formato de salida
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ 
          quality,
          effort: 6, // Nivel de compresión (0-6)
          smartSubsample: true,
        });
        break;
      case 'avif':
        pipeline = pipeline.avif({ 
          quality,
          effort: 5, // Nivel de compresión (0-9)
          chromaSubsampling: '4:2:0',
        });
        break;
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({ 
          quality,
          mozjpeg: true,
          progressive: true,
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9, // Máxima compresión
          progressive: true,
        });
        break;
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }

    // Aplicar optimizaciones adicionales con imagemin
    let buffer = await pipeline.toBuffer();
    
    // Solo optimizar formatos soportados
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(format)) {
      buffer = await imagemin.buffer(buffer, {
        plugins: [
          imageminMozjpeg({ quality }),
          imageminPngquant({
            quality: [0.6, 0.8],
            speed: 1,
          }),
          imageminGifsicle(),
          imageminSvgo({
            plugins: [
              { removeViewBox: false },
              { cleanupIDs: false },
            ],
          }),
        ].filter(Boolean),
      });
    }

    // Guardar archivo
    if (!options.dryRun) {
      await fs.writeFile(outputFile, buffer);
    }

    const stats = await getFileStats(inputPath);
    const optimizedStats = await getFileStats(outputFile);
    
    return {
      input: inputPath,
      output: outputFile,
      format,
      width: width || 'original',
      originalSize: stats?.size || 0,
      optimizedSize: optimizedStats?.size || 0,
      saved: stats ? ((stats.size - (optimizedStats?.size || 0)) / stats.size * 100).toFixed(2) : 0,
      skipped: false,
    };
  } catch (error) {
    console.error(chalk.red(`Error procesando ${inputPath}:`), error);
    return { error: error.message };
  }
}

// Procesar directorio de imágenes
async function processImages() {
  const startTime = Date.now();
  let totalSaved = 0;
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  try {
    // Asegurar que existen los directorios
    await ensureDir(options.output);
    
    // Buscar archivos de imagen
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const pattern = `${options.input}/**/*.{${imageExtensions.join(',')}}`;
    const files = await glob(pattern, { nodir: true, ignore: ['**/node_modules/**', '**/.git/**'] });

    if (files.length === 0) {
      console.log(chalk.yellow('No se encontraron imágenes para optimizar.'));
      return;
    }

    console.log(chalk.blue(`\nOptimizando ${files.length} imágenes...\n`));

    // Procesar cada archivo
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const ext = path.extname(file).toLowerCase().slice(1);
      
      // Omitir archivos que ya están en el directorio de salida
      if (file.startsWith(path.resolve(options.output))) {
        if (options.verbose) {
          console.log(chalk.gray(`  Omitiendo archivo en directorio de salida: ${relativePath}`));
        }
        continue;
      }

      // Determinar formato de salida
      const outputFormats = options.formats.includes(ext) ? options.formats : [...options.formats, ext];
      
      console.log(chalk.cyan(`Procesando: ${relativePath}`));
      
      // Procesar cada formato y tamaño
      for (const format of outputFormats) {
        for (const width of [null, ...options.widths]) {
          const outputPath = path.join(
            options.output,
            path.relative(options.input, file)
          );
          
          const result = await optimizeImage(file, outputPath, format, width, options.quality);
          
          if (result.error) {
            console.error(chalk.red(`  ✗ Error: ${result.error}`));
            totalErrors++;
          } else if (result.skipped) {
            totalSkipped++;
          } else {
            const saved = parseFloat(result.saved || 0);
            totalSaved += saved;
            totalProcessed++;
            
            if (options.verbose) {
              const sizeInfo = width 
                ? `${width}w` 
                : 'original';
              
              console.log(
                `  ✓ Generado: ${path.basename(result.output)} (${sizeInfo}, ` +
                `${format}, ${(result.originalSize / 1024).toFixed(1)}KB → ` +
                `${(result.optimizedSize / 1024).toFixed(1)}KB, ` +
                `${saved > 0 ? chalk.green(`-${saved}%`) : chalk.yellow('+0%')})`
              );
            }
          }
        }
      }
    }

    // Mostrar resumen
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(chalk.blue('\nResumen de optimización:'));
    console.log(chalk.gray('═'.repeat(50)));
    console.log(`  Imágenes procesadas: ${chalk.cyan(totalProcessed + totalSkipped)}`);
    console.log(`  Optimizadas:         ${chalk.green(totalProcessed)}`);
    console.log(`  Omitidas:            ${chalk.yellow(totalSkipped)}`);
    console.log(`  Errores:             ${chalk.red(totalErrors)}`);
    
    if (totalProcessed > 0) {
      const avgSaved = (totalSaved / totalProcessed).toFixed(2);
      console.log(`  Ahorro promedio:     ${chalk.green(avgSaved)}% por imagen`);
    }
    
    console.log(`  Tiempo de ejecución: ${chalk.cyan(executionTime)} segundos`);
    
    if (options.dryRun) {
      console.log(chalk.yellow('\nModo simulación activado. No se realizaron cambios en los archivos.'));
    }
    
    console.log(chalk.gray('═'.repeat(50)));
    
  } catch (error) {
    console.error(chalk.red('\nError durante la optimización:'), error);
    process.exit(1);
  }
}

// Ejecutar el script
processImages();
