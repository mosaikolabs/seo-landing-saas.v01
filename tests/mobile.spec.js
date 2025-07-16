const { test, expect } = require('@playwright/test');

test.describe('Pruebas de compatibilidad móvil', () => {
  test('La página de inicio se carga correctamente en móviles', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que el título de la página es correcto
    await expect(page).toHaveTitle(/SEO para Joyerías/);
    
    // Verificar que el header es visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Verificar que el menú de navegación es accesible
    const menuButton = page.locator('button[aria-label="Abrir menú"]');
    await expect(menuButton).toBeVisible();
    
    // Verificar que el botón CTA principal es visible
    const mainCta = page.locator('a:has-text("Solicitar Análisis Gratis")').first();
    await expect(mainCta).toBeVisible();
  });

  test('El menú de navegación funciona correctamente en móviles', async ({ page }) => {
    await page.goto('/');
    
    // Abrir el menú
    const menuButton = page.locator('button[aria-label="Abrir menú"]');
    await menuButton.click();
    
    // Verificar que el menú está visible
    const navMenu = page.locator('nav[aria-label="Navegación principal"]');
    await expect(navMenu).toBeVisible();
    
    // Verificar que los enlaces del menú son accesibles
    const menuLinks = page.locator('nav a');
    const count = await menuLinks.count();
    expect(count).toBeGreaterThan(0);
    
    // Cerrar el menú
    const closeButton = page.locator('button[aria-label="Cerrar menú"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(navMenu).toBeHidden();
    }
  });

  test('El formulario de contacto es funcional en móviles', async ({ page }) => {
    await page.goto('/');
    
    // Desplazarse al formulario (si es necesario)
    const form = page.locator('form');
    await form.scrollIntoViewIfNeeded();
    
    // Verificar que los campos del formulario son visibles
    const nameInput = form.locator('input[name="nombre"]');
    const emailInput = form.locator('input[type="email"]');
    const phoneInput = form.locator('input[type="tel"]');
    const messageInput = form.locator('textarea');
    const submitButton = form.locator('button[type="submit"]');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(messageInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Probar la validación del formulario
    await submitButton.click();
    
    // Verificar que se muestran mensajes de error para campos requeridos
    const errorMessages = page.locator('.error-message');
    await expect(errorMessages).toHaveCount(4); // Suponiendo 4 campos requeridos
    
    // Rellenar el formulario con datos de prueba
    await nameInput.fill('Prueba de Usuario');
    await emailInput.fill('test@example.com');
    await phoneInput.fill('+1234567890');
    await messageInput.fill('Este es un mensaje de prueba');
    
    // Verificar que los mensajes de error desaparecen al rellenar los campos
    await expect(errorMessages).toHaveCount(0);
    
    // Nota: Para pruebas reales de envío, podrías mockear la llamada a la API
  });

  test('Las imágenes se cargan correctamente con lazy loading', async ({ page }) => {
    await page.goto('/');
    
    // Desplazarse por la página para activar la carga de imágenes
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Verificar que las imágenes principales tienen el atributo loading="lazy"
    const images = page.locator('img[loading="lazy"]');
    const lazyImageCount = await images.count();
    expect(lazyImageCount).toBeGreaterThan(0);
    
    // Verificar que las imágenes se cargan correctamente
    for (let i = 0; i < Math.min(lazyImageCount, 5); i++) {
      const image = images.nth(i);
      await expect(image).toHaveJSProperty('complete', true);
    }
  });

  test('La página es responsive en diferentes tamaños de pantalla', async ({ page, browserName }) => {
    // Saltar esta prueba en CI para ahorrar tiempo
    test.skip(!!process.env.CI, 'Prueba de responsividad omitida en CI');
    
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },     // iPhone 8
      { width: 414, height: 896, name: 'mobile_large' }, // iPhone XR
      { width: 768, height: 1024, name: 'tablet' },    // iPad
      { width: 1024, height: 1366, name: 'tablet_large' }, // iPad Pro
      { width: 1280, height: 800, name: 'desktop' },   // Laptop
      { width: 1920, height: 1080, name: 'desktop_large' } // Desktop grande
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Tomar una captura de pantalla para referencia
      await page.screenshot({
        path: `test-results/screenshot-${viewport.name}-${browserName}.png`,
        fullPage: true
      });
      
      // Verificar que el diseño es correcto
      const header = page.locator('header');
      await expect(header).toBeInViewport();
      
      // Verificar que el contenido principal es visible
      const mainContent = page.locator('main');
      await expect(mainContent).toBeInViewport();
      
      // Verificar que el footer está en la parte inferior
      const footer = page.locator('footer');
      await expect(footer).toBeInViewport();
      
      // Verificar que no hay desbordamiento horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    }
  });
});
