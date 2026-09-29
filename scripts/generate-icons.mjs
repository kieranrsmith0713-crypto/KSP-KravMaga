/**
 * Generates the PWA PNG icons (an outline shield with two orange strike
 * marks) by rendering a small HTML/SVG page and screenshotting it with
 * Playwright — this is a dev-only tool, not part of the app bundle. Colors
 * match hub-foundations' v3 palette, the same dark/orange family as the rest
 * of the Hub. Re-run whenever the brand mark or colors change:
 * `node scripts/generate-icons.mjs` (requires
 * `npm install --no-save playwright` first if it isn't already present).
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

const BG = '#12141a' // --bg
const FG = '#f2f0eb' // --text
const ACCENT = '#e8501e' // --primary

function iconHtml(size, radiusPct) {
  return `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  html, body { margin: 0; padding: 0; }
  .icon {
    width: ${size}px;
    height: ${size}px;
    background: ${BG};
    border-radius: ${radiusPct}%;
    overflow: hidden;
  }
  .icon svg { display: block; width: 100%; height: 100%; }
</style></head>
<body>
  <div class="icon">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 18 L76 28 V50 C76 66 64 77 50 83 C36 77 24 66 24 50 V28 Z" stroke="${FG}" stroke-width="6" stroke-linejoin="round" />
      <line x1="38" y1="60" x2="54" y2="37" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round" />
      <line x1="48" y1="64" x2="63" y2="42" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round" />
    </svg>
  </div>
</body></html>`
}

async function renderIcon(browser, size, radiusPct, outFile) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(iconHtml(size, radiusPct))
  const el = await page.$('.icon')
  const buffer = await el.screenshot({ omitBackground: false })
  writeFileSync(join(publicDir, outFile), buffer)
  await page.close()
  console.log(`wrote public/${outFile} (${size}x${size})`)
}

const browser = await chromium.launch()
// Standard icons: gentle rounding.
await renderIcon(browser, 192, 20, 'pwa-192x192.png')
await renderIcon(browser, 512, 20, 'pwa-512x512.png')
// Apple touch icon: iOS applies its own mask, so no rounding here.
await renderIcon(browser, 180, 0, 'apple-touch-icon.png')
// Favicon: small, gentle rounding.
await renderIcon(browser, 64, 20, 'favicon.png')
await browser.close()
