// Renders every concept in headless Chromium and saves desktop + mobile screenshots
// to ./screenshots. Also prints horizontal overflow and page errors.
// Usage: npm install && npx playwright install chromium && npm run shots
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'screenshots');
const concepts = fs.readdirSync(path.join(root, 'concepts')).filter(f => f.endsWith('.html')).sort();
const viewports = [
  { tag: 'desktop', width: 1360, height: 900, scheme: 'light' },
  { tag: 'mobile', width: 390, height: 844, scheme: 'light' },
];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  let failed = false;
  for (const file of concepts) {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, colorScheme: vp.scheme });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.goto('file://' + path.join(root, 'concepts', file));
      await page.waitForTimeout(2500); // let intro animations settle
      const name = file.replace('.html', '') + '-' + vp.tag + '.png';
      await page.screenshot({ path: path.join(outDir, name), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      console.log(`${name}  overflowX=${overflow}  errors=${errors.length}`);
      errors.forEach(e => console.log('   ! ' + e));
      if (errors.length || overflow > 0) failed = true;
      await page.close();
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
