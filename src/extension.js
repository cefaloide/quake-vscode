'use strict';

const vscode = require('vscode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { buildSvg } = require('./glyph');

const SECTION = 'quakeQ';
const UPDATE_DELAY_MS = 50;

let context;
let decorationType;
let pattern;
let renderOptions; // per character, only in pixel mode
let timer;

function activate(ctx) {
  context = ctx;

  ctx.subscriptions.push(
    vscode.commands.registerCommand('quakeQ.toggle', async () => {
      const config = vscode.workspace.getConfiguration(SECTION);
      await config.update('enabled', !config.get('enabled'), vscode.ConfigurationTarget.Global);
    }),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(SECTION) || e.affectsConfiguration('editor')) {
        rebuild();
      }
    }),
    vscode.window.onDidChangeVisibleTextEditors(scheduleUpdate),
    vscode.window.onDidChangeTextEditorVisibleRanges(scheduleUpdate),
    vscode.workspace.onDidChangeTextDocument(e => {
      if (vscode.window.visibleTextEditors.some(ed => ed.document === e.document)) {
        scheduleUpdate();
      }
    }),
    { dispose: disposeDecoration }
  );

  rebuild();
}

function deactivate() {
  disposeDecoration();
}

function disposeDecoration() {
  clearTimeout(timer);
  if (decorationType) {
    decorationType.dispose();
    decorationType = undefined;
  }
}

function rebuild() {
  disposeDecoration();
  const config = vscode.workspace.getConfiguration(SECTION);
  if (!config.get('enabled')) return;

  pattern = config.get('includeUppercase') ? /[qQ]/g : /q/g;
  const fontFamily = (config.get('fontFamily') || '').trim();
  if (fontFamily) {
    decorationType = createFontDecoration(fontFamily);
    renderOptions = undefined;
  } else {
    decorationType = createPixelDecoration();
    renderOptions = { q: pixelRenderOptions('q', config), Q: pixelRenderOptions('Q', config) };
  }
  updateAll();
}

// Uses a Quake font installed on the system, injected through the CSS
// text-decoration property (the decoration API has no font-family option).
function createFontDecoration(fontFamily) {
  const family = fontFamily.replace(/['";{}]/g, '');
  return vscode.window.createTextEditorDecorationType({
    textDecoration: `none; font-family: '${family}', monospace`
  });
}

// Hides the real character and draws the bundled pixel glyph over its cell.
// Two decoration types would be needed for q and Q, so the image is chosen
// per range through renderOptions instead.
function createPixelDecoration() {
  return vscode.window.createTextEditorDecorationType({
    color: 'transparent',
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });
}

function pixelRenderOptions(char, config) {
  const metrics = editorMetrics();
  const style = {
    color: sanitizeColor(config.get('color'), '#d8b070'),
    shadowColor: sanitizeColor(config.get('shadowColor'), '#7a4a20'),
    verticalOffset: Number(config.get('verticalOffset')) || 0,
    scale: Math.max(1, Math.min(3, Number(config.get('scale')) || 1.5))
  };
  const { svg, width } = buildSvg(char, metrics, style);
  // The glyph may be wider than one character, so the image is centred over
  // the cell and spills into its neighbours.
  const overhang = Math.round((width - metrics.charWidth) / 2 * 100) / 100;
  return {
    before: {
      contentIconPath: writeSvg(svg),
      width: `${width}px`,
      height: `${metrics.lineHeight}px`,
      // Zero net width: the image overlaps the (transparent) real character,
      // so cursor positions and column alignment stay untouched.
      margin: `0 -${width - overhang}px 0 -${overhang}px`,
      textDecoration: 'none; vertical-align: top; pointer-events: none'
    }
  };
}

function editorMetrics() {
  const editor = vscode.workspace.getConfiguration('editor');
  const fontSize = Number(editor.get('fontSize')) || 14;
  const letterSpacing = Number(editor.get('letterSpacing')) || 0;
  let lineHeight = Number(editor.get('lineHeight')) || 0;
  if (lineHeight <= 0) {
    lineHeight = Math.round((process.platform === 'darwin' ? 1.5 : 1.35) * fontSize);
  } else if (lineHeight < 8) {
    lineHeight = Math.round(lineHeight * fontSize);
  }
  // Monospace fonts are roughly 0.6em wide; exact width isn't critical since
  // the glyph overlays the real character instead of replacing its box.
  const charWidth = Math.round((fontSize * 0.6 + letterSpacing) * 100) / 100;
  return { fontSize, lineHeight, charWidth };
}

function sanitizeColor(value, fallback) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value.trim())
    ? value.trim()
    : fallback;
}

const writtenSvgs = new Map();

function writeSvg(svg) {
  const hash = crypto.createHash('sha1').update(svg).digest('hex').slice(0, 12);
  let uri = writtenSvgs.get(hash);
  if (!uri) {
    const dir = context.globalStorageUri.fsPath;
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `q-${hash}.svg`);
    fs.writeFileSync(file, svg);
    uri = vscode.Uri.file(file);
    writtenSvgs.set(hash, uri);
  }
  return uri;
}

function scheduleUpdate() {
  clearTimeout(timer);
  timer = setTimeout(updateAll, UPDATE_DELAY_MS);
}

function updateAll() {
  for (const editor of vscode.window.visibleTextEditors) {
    updateEditor(editor);
  }
}

function updateEditor(editor) {
  if (!decorationType) return;
  const doc = editor.document;
  const decorations = [];
  for (const visible of editor.visibleRanges) {
    // A little margin so fast scrolling doesn't show undecorated lines.
    const startLine = Math.max(0, visible.start.line - 20);
    const endLine = Math.min(doc.lineCount - 1, visible.end.line + 20);
    for (let line = startLine; line <= endLine; line++) {
      const text = doc.lineAt(line).text;
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text))) {
        const range = new vscode.Range(line, match.index, line, match.index + 1);
        decorations.push(renderOptions ? { range, renderOptions: renderOptions[match[0]] } : { range });
      }
    }
  }
  editor.setDecorations(decorationType, decorations);
}

module.exports = { activate, deactivate };
