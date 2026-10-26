'use strict';

// Pixel-art glyphs shaped like the Quake 1 logo: a ring open at the top with
// a nail (crossbar near its head) through the middle, its point hanging below
// the baseline like the letter's tail.
// '#' = pixel, '.' = empty. `ascent` is the number of rows above the baseline.
const GLYPHS = {
  q: {
    ascent: 6,
    rows: [
      '#.....#',
      '#..#..#',
      '#.###.#',
      '#..#..#',
      '.#.#.#.',
      '..###..',
      '...#...',
      '...#...'
    ]
  },
  Q: {
    ascent: 7,
    rows: [
      '#.....#',
      '#.....#',
      '#..#..#',
      '#.###.#',
      '#..#..#',
      '.#.#.#.',
      '..###..',
      '...#...',
      '...#...',
      '...#...'
    ]
  }
};

const COLUMNS = 7;

/**
 * Builds an SVG the size of one editor character cell (charWidth x lineHeight)
 * with the glyph sitting on the text baseline.
 */
function buildSvg(char, metrics, style) {
  const glyph = GLYPHS[char];
  if (!glyph) {
    throw new Error(`No glyph for ${JSON.stringify(char)}`);
  }
  const { charWidth, lineHeight, fontSize } = metrics;
  const pixel = charWidth / (COLUMNS + 1);
  const left = (charWidth - COLUMNS * pixel) / 2;
  // Approximate baseline of a monospace font vertically centred in the line.
  const baseline = lineHeight / 2 + fontSize * 0.33 + (style.verticalOffset || 0);
  const top = baseline - glyph.ascent * pixel;

  let path = '';
  glyph.rows.forEach((row, y) => {
    // Merge horizontal runs into one rect each to keep the SVG small.
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '#') continue;
      let end = x;
      while (row[end + 1] === '#') end++;
      path += `M${r(left + x * pixel)} ${r(top + y * pixel)}h${r((end - x + 1) * pixel)}v${r(pixel)}h${r(-(end - x + 1) * pixel)}z`;
      x = end;
    }
  });

  const gTop = r(top);
  const gBottom = r(top + glyph.rows.length * pixel);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${r(charWidth)}" height="${r(lineHeight)}" ` +
    `viewBox="0 0 ${r(charWidth)} ${r(lineHeight)}" shape-rendering="crispEdges">` +
    `<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="${gTop}" x2="0" y2="${gBottom}">` +
    `<stop offset="0" stop-color="${style.color}"/><stop offset="1" stop-color="${style.shadowColor}"/>` +
    `</linearGradient></defs><path fill="url(#g)" d="${path}"/></svg>`
  );
}

function r(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { GLYPHS, buildSvg };
