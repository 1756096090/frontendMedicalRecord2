// tests/selenium.smoke.js
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const APP_URL = process.env.APP_URL || 'http://localhost:4173'; // vite preview por defecto
const TIMEOUT = 20_000;

async function main() {
  // Opciones Chrome headless (válido para CI/local)
  const options = new chrome.Options()
    .addArguments(
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,800'
    );

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log(`➡️  Abriendo: ${APP_URL}`);
    await driver.get(APP_URL);

    // Espera a que el documento tenga título (cualquier no vacío)
    await driver.wait(async () => {
      const t = await driver.getTitle();
      return t && t.trim().length > 0;
    }, TIMEOUT);
    const title = await driver.getTitle();
    console.log(`✅ Título detectado: "${title}"`);

    // Verifica que exista el contenedor #root (Vite + React)
    const root = await driver.wait(until.elementLocated(By.css('#root')), TIMEOUT);
    await driver.wait(until.elementIsVisible(root), TIMEOUT);
    console.log('✅ #root presente y visible');

    // (Opcional) valida que cargó React renderizado (busca un nodo hijo dentro de #root)
    const rootChild = await driver.findElements(By.css('#root *'));
    if (rootChild.length === 0) {
      throw new Error('El contenedor #root no tiene contenido renderizado.');
    }
    console.log('✅ Contenido renderizado en #root');

    // (Opcional) valida que la SPA responde (ejemplo: navegación a /)
    // await driver.get(`${APP_URL}/`);
    // ... agrega selectores/textos específicos de tu app si lo deseas.

    console.log('🎉 Smoke test Selenium OK');
  } finally {
    await driver.quit();
  }
}

main().catch((err) => {
  console.error('❌ Selenium smoke FAILED');
  console.error(err);
  process.exit(1);
});
