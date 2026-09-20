// Optional browser check: uses an installed Playwright, with no production credentials.
// PLAYWRIGHT_MODULE may point to a bundled playwright/index.mjs; output goes to QA_OUTPUT_DIR.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = process.env.QA_OUTPUT_DIR;
if (!output && !process.env.QA_SERVE_ONLY) throw new Error('Set QA_OUTPUT_DIR to a local evidence directory.');
const intake = Boolean(process.env.QA_INTAKE);
const entry = intake ? 'tests/fixtures/intakePreview.tsx' : 'tests/fixtures/dashboardPreview.tsx';
const backend = resolve(root, intake ? 'tests/fixtures/intakeBackend.ts' : 'tests/fixtures/dashboardBackend.ts');
const server = await createServer({
  root, configFile: false,
  optimizeDeps: { entries: [entry] },
  plugins: [{
    name: 'isolated-dashboard-fixture', enforce: 'pre',
    resolveId(source, importer) {
      if (importer?.includes('/src/') && /^\.\.\/lib\/(firebase|gemini)$/.test(source)) return backend;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/' || req.url?.startsWith('/app')) {
          res.setHeader('Content-Type', 'text/html');
          res.end(await server.transformIndexHtml(req.url, `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local QA</title></head><body><div id="root"></div><script type="module" src="/${entry}"></script></body></html>`));
        } else next();
      });
    },
  }, react({ jsxRuntime: 'classic' }), tailwindcss()],
  server: { host: '127.0.0.1', port: Number(process.env.QA_PORT) || 0, watch: { usePolling: true } },
});
await server.listen();
if (process.env.QA_SERVE_ONLY) {
  console.log(`Synthetic fixture ready at http://127.0.0.1:${server.httpServer.address().port}/app`);
  await new Promise(() => {});
}
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}) });
const errors = [];
const checks = [];
try {
  await mkdir(output, { recursive: true });
  const port = server.httpServer.address().port;
  for (const width of [1440, 768, 390, 320]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 960 }, colorScheme: theme, reducedMotion: 'reduce' });
      // Only local fixture traffic is permitted; no Firebase, AI, or Google requests.
      await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${port}/app`);
      await page.getByRole('heading', { name: 'Command Center', exact: true }).waitFor();
      const checkWidth = async label => {
        const dimensions = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
        assert.ok(dimensions.document <= dimensions.viewport, `${width}/${theme}/${label}: horizontal overflow ${JSON.stringify(dimensions)}`);
        checks.push(`${width}/${theme}/${label}: no overflow`);
      };
      await checkWidth('overview');
      if (width === 1440 || width === 390) await page.screenshot({ path: resolve(output, `overview-${width}-${theme}.png`), fullPage: true });
      const lifecycleToggle = page.getByRole('button', { name: width < 1280 ? 'View all' : 'View entire lifecycle', exact: true });
      await lifecycleToggle.click();
      await checkWidth('expanded lifecycle');
      await page.getByRole('button', { name: /3\. Understand/ }).click();
      await page.getByRole('heading', { name: /Enterprise DNA$/ }).waitFor();
      await checkWidth('DNA');
      await page.reload();
      await page.getByRole('heading', { name: /Enterprise DNA$/ }).waitFor();
      const nav = page.getByRole('navigation', { name: width < 1024 ? 'Mobile workspace navigation' : 'Workspace navigation', exact: true });
      await nav.getByRole('button', { name: 'Overview' }).click();
      await page.goBack();
      await page.getByRole('heading', { name: /Enterprise DNA$/ }).waitFor();
      await nav.getByRole('button', { name: 'Plan', exact: true }).click();
      await page.getByRole('button', { name: 'Wave Plan', exact: true }).waitFor();
      await checkWidth('plan');
      await page.getByRole('button', { name: 'Mobilize', exact: true }).click();
      assert.ok(page.url().includes('stage=mobilize'));
      await checkWidth('mobilize');
      await page.getByRole('button', { name: 'New Assessment' }).click();
      await checkWidth('assessment');
      await page.getByRole('button', { name: /Appearance:/ }).click();
      await page.keyboard.press('Home');
      assert.equal(await page.getByRole('menuitemradio', { name: 'Light' }).evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.emulateMedia({ colorScheme: theme === 'dark' ? 'light' : 'dark' });
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), theme !== 'dark');
      checks.push(`${width}/${theme}: refresh, back, stages, keyboard appearance, OS theme change passed`);
      await context.close();
    }
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify({ fixture: 'Synthetic local adapter; no authentication or production services exercised', checks, errors }, null, 2));
  console.log(JSON.stringify({ passed: checks.length, errors, output }));
} finally { await browser.close(); await server.close(); }
