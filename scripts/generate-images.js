// Regenerates images/icon.png and images/screenshot.png: node scripts/generate-images.js
const { chromium } = require('playwright');
const path = require('path');
const { ASPECT, buildSvg } = require('../src/glyph');

const repo = path.join(__dirname, '..');
const style = { color: '#d8b070', shadowColor: '#7a4a20' };

// Icon: the Quake logo on a dark, beveled metal plate.
function iconHtml() {
  const iconHeight = 190;
  const iconWidth = iconHeight * ASPECT;
  const logo = (dx, dy) =>
    `<g transform="translate(${dx} ${dy})">${buildSvg({ width: 256, height: 256, iconWidth, iconHeight, top: (256 - iconHeight) / 2 }, style)}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1c"/><stop offset="1" stop-color="#1a120c"/></linearGradient></defs>
<rect x="8" y="8" width="240" height="240" rx="28" fill="url(#bg)" stroke="#5a4028" stroke-width="6"/>
<rect x="22" y="22" width="212" height="212" rx="18" fill="none" stroke="#120c08" stroke-width="4"/>
<g opacity="0.6" style="filter:brightness(0)">${logo(5, 5)}</g>
${logo(0, 0)}
</svg>`;
  return `<body style="margin:0;background:transparent">${svg}</body>`;
}

// Mirrors iconRenderOptions() in src/extension.js with default settings.
const X_HEIGHT = 0.53;
const CAP_HEIGHT = 0.72;
const DESCENT = 0.22;

function overlay(char, fontSize, lineHeight, charWidth) {
  const ascent = char === 'Q' ? CAP_HEIGHT : X_HEIGHT;
  const iconHeight = Math.min((ascent + DESCENT) * fontSize, lineHeight);
  const iconWidth = iconHeight * ASPECT;
  const width = Math.max(iconWidth, charWidth);
  const baseline = lineHeight / 2 + fontSize * 0.33;
  const bottom = baseline + DESCENT * fontSize;
  const top = Math.max(0, Math.min(lineHeight - iconHeight, bottom - iconHeight));
  const svg = buildSvg({ width, height: lineHeight, iconWidth, iconHeight, top }, style);
  const overhang = (width - charWidth) / 2;
  return `<img style="vertical-align:top;width:${width}px;height:${lineHeight}px;margin:0 -${width - overhang}px 0 -${overhang}px" ` +
    `src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`;
}

// Screenshot: an editor-like mockup using the extension's overlay technique.
function screenshotHtml() {
  const fontSize = 18, lineHeight = 26, charWidth = 10.84;
  const code = [
    [['// Quake Q: only the letter q changes', '#6a9955']],
    [],
    [['import', '#c586c0'], [' { query } ', '#9cdcfe'], ['from', '#c586c0'], [" './quake'", '#ce9178'], [';', '#d4d4d4']],
    [],
    [['function', '#569cd6'], [' requestQuad', '#dcdcaa'], ['(', '#d4d4d4'], ['queue', '#9cdcfe'], [') {', '#d4d4d4']],
    [['  const', '#569cd6'], [' quake ', '#4fc1ff'], ['= ', '#d4d4d4'], ['query', '#dcdcaa'], ['(', '#d4d4d4'], ["'Quad Damage'", '#ce9178'], [');', '#d4d4d4']],
    [['  if', '#c586c0'], [' (', '#d4d4d4'], ['quake', '#4fc1ff'], ['.', '#d4d4d4'], ['equipped', '#9cdcfe'], [') ', '#d4d4d4'], ['return', '#c586c0'], [' queue', '#9cdcfe'], [';', '#d4d4d4']],
    [['  queue', '#9cdcfe'], ['.', '#d4d4d4'], ['enqueue', '#dcdcaa'], ['(', '#d4d4d4'], ['quake', '#4fc1ff'], [');', '#d4d4d4']],
    [['  return', '#c586c0'], [' queue', '#9cdcfe'], [';', '#d4d4d4']],
    [['}', '#d4d4d4']]
  ];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const render = text => [...text]
    .map(ch => /[qQ]/.test(ch)
      ? overlay(ch, fontSize, lineHeight, charWidth) + `<span style="color:transparent">${ch}</span>`
      : esc(ch))
    .join('');
  const lines = code.map((tokens, i) => {
    const body = tokens.map(([text, color]) => `<span style="color:${color}">${render(text)}</span>`).join('');
    return `<div class="ln"><span class="no">${i + 1}</span><span class="tx">${body}</span></div>`;
  }).join('');
  return `<style>
body{margin:0;background:#181818;font-family:'DejaVu Sans Mono',monospace}
.win{width:760px;border:1px solid #2b2b2b}
.tabs{background:#181818;height:35px;display:flex;font:13px sans-serif}
.tab{background:#1f1f1f;color:#fff;padding:0 16px;line-height:35px;border-top:1px solid #0078d4}
.ed{background:#1f1f1f;padding:10px 0 14px;font-size:${fontSize}px;line-height:${lineHeight}px}
.ln{display:flex;height:${lineHeight}px;white-space:pre}
.no{width:52px;text-align:right;padding-right:22px;color:#6e7681}
.tx{color:#d4d4d4}
</style><div class="win"><div class="tabs"><div class="tab">quake.js</div></div><div class="ed">${lines}</div></div>`;
}

(async () => {
  const browser = await chromium.launch();
  let page = await browser.newPage({ viewport: { width: 256, height: 256 } });
  await page.setContent(iconHtml());
  await page.screenshot({ path: path.join(repo, 'images/icon.png'), omitBackground: true });
  page = await browser.newPage({ viewport: { width: 762, height: 330 }, deviceScaleFactor: 2 });
  await page.setContent(screenshotHtml());
  await page.locator('.win').screenshot({ path: path.join(repo, 'images/screenshot.png') });
  await browser.close();
})();
