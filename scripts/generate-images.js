const { chromium } = require('playwright');
const path = require('path');
// Regenerates images/icon.png and images/screenshot.png: node scripts/generate-images.js
const repo = path.join(__dirname, '..');
const { GLYPHS, buildSvg } = require(path.join(repo, 'src/glyph.js'));

// Icon: the q glyph enlarged on a dark, beveled metal plate.
function iconHtml() {
  const g = GLYPHS.q, px = 22, w = 7 * px, h = g.rows.length * px;
  const ox = (256 - w) / 2, oy = (256 - h) / 2 + 6;
  let rects = '';
  g.rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') rects += `<rect x="${ox + x * px}" y="${oy + y * px}" width="${px}" height="${px}"/>`;
  }));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" shape-rendering="crispEdges">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1c"/><stop offset="1" stop-color="#1a120c"/></linearGradient>
<linearGradient id="q" gradientUnits="userSpaceOnUse" x1="0" y1="${oy}" x2="0" y2="${oy + h}"><stop offset="0" stop-color="#f0c880"/><stop offset="0.55" stop-color="#c08848"/><stop offset="1" stop-color="#6a3a18"/></linearGradient>
</defs>
<rect x="8" y="8" width="240" height="240" rx="28" fill="url(#bg)" stroke="#5a4028" stroke-width="6"/>
<rect x="22" y="22" width="212" height="212" rx="18" fill="none" stroke="#120c08" stroke-width="4"/>
<g fill="#000" opacity="0.55" transform="translate(8 8)">${rects}</g>
<g fill="url(#q)">${rects}</g>
</svg>`;
  return `<body style="margin:0;background:transparent">${svg}</body>`;
}

// Screenshot: editor-like mockup with the extension's real overlay technique.
function screenshotHtml() {
  const fontSize = 18, lineHeight = 26, cw = 10.8;
  const m = { fontSize, lineHeight, charWidth: cw };
  // Same overlay as pixelRenderOptions() in src/extension.js, default settings.
  const st = { color: '#d8b070', shadowColor: '#7a4a20', scale: 1.5 };
  const img = c => {
    const { svg, width } = buildSvg(c, m, st);
    const overhang = (width - cw) / 2;
    return `<img style="vertical-align:top;width:${width}px;height:${lineHeight}px;margin:0 -${width - overhang}px 0 -${overhang}px" ` +
      `src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`;
  };
  const code = [
    ['// Quake Q: by default only the uppercase Q changes', '#6a9955'],
    null,
    [['import', '#c586c0'], [' { Quake, QuadDamage } ', '#9cdcfe'], ['from', '#c586c0'], [" './quake'", '#ce9178'], [';', '#d4d4d4']],
    null,
    [['const', '#569cd6'], [' quake ', '#4fc1ff'], ['= ', '#d4d4d4'], ['new', '#569cd6'], [' Quake', '#4ec9b0'], ['({ ', '#d4d4d4'], ['quality', '#9cdcfe'], [': ', '#d4d4d4'], ["'High'", '#ce9178'], [' });', '#d4d4d4']],
    [['quake', '#4fc1ff'], ['.', '#d4d4d4'], ['on', '#dcdcaa'], ['(', '#d4d4d4'], ["'Quad'", '#ce9178'], [', () ', '#d4d4d4'], ['=>', '#569cd6'], [' QuadDamage', '#4ec9b0'], ['.', '#d4d4d4'], ['activate', '#dcdcaa'], ['());', '#d4d4d4']],
    null,
    [['const', '#569cd6'], [' QUEUE_SIZE ', '#4fc1ff'], ['= ', '#d4d4d4'], ['4', '#b5cea8'], [';', '#d4d4d4'], [' // lowercase q stays as is', '#6a9955']],
  ];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const render = t => [...t].map(ch => ch === 'Q' ? img(ch) + `<span style="color:transparent">${ch}</span>` : esc(ch)).join('');
  const lines = code.map((l, i) => {
    let body = '';
    if (l && typeof l[0] === 'string') body = `<span style="color:${l[1]}">${render(l[0])}</span>`;
    else if (l) body = l.map(([t, c]) => `<span style="color:${c}">${render(t)}</span>`).join('');
    return `<div class="ln"><span class="no">${i + 1}</span><span class="tx">${body}</span></div>`;
  }).join('');
  return `<style>
body{margin:0;background:#181818;font-family:'DejaVu Sans Mono',monospace}
.win{width:760px;border:1px solid #2b2b2b}
.tabs{background:#181818;height:35px;display:flex;font:13px sans-serif}
.tab{background:#1f1f1f;color:#fff;padding:0 16px;line-height:35px;border-top:1px solid #0078d4}
.ed{background:#1f1f1f;padding:10px 0 14px;font-size:${fontSize}px;line-height:${lineHeight}px}
.ln{display:flex;height:${lineHeight}px;white-space:pre}.no{width:52px;text-align:right;padding-right:22px;color:#6e7681}.tx{color:#d4d4d4}
</style><div class="win"><div class="tabs"><div class="tab">quake.js</div></div><div class="ed">${lines}</div></div>`;
}

(async () => {
  const b = await chromium.launch();
  let p = await b.newPage({ viewport: { width: 256, height: 256 } });
  await p.setContent(iconHtml());
  await p.screenshot({ path: path.join(repo, 'images/icon.png'), omitBackground: true });
  p = await b.newPage({ viewport: { width: 762, height: 330 }, deviceScaleFactor: 2 });
  await p.setContent(screenshotHtml());
  await p.locator('.win').screenshot({ path: path.join(repo, 'images/screenshot.png') });
  await b.close();
})();
