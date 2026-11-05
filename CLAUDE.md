# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git commits

- Author and committer: `Joan Rueda <joanruedapau@gmail.com>`. Before committing, set it in the repository config:
  `git config user.name "Joan Rueda" && git config user.email "joanruedapau@gmail.com"`
- Do not add trailer lines to commit messages: no `Co-Authored-By:`, no `Claude-Session:`, nor any other attribution line.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `<type>(<optional scope>): <description>`.
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  - Description in English, imperative mood, lowercase, no trailing period, e.g. `feat(glyph): round the q ring`.
  - Breaking changes (such as renaming or removing a setting) use `!` after the type/scope and a `BREAKING CHANGE:` footer explaining it.

## Project

- VS Code extension, plain JavaScript with no build step, no dependencies and no test suite: `src/extension.js` (decorations and settings) and `src/glyph.js` (pixel-art glyphs).
- Everything in the repository is written in English.

## Commands

- Run: open the folder in VS Code and press `F5` (the "Run Extension" config in `.vscode/launch.json`).
- Package: `npx @vscode/vsce package`. Check the packaged file list with `npx @vscode/vsce ls`.
- After changing a glyph, regenerate `images/icon.png` and `images/screenshot.png` with `node scripts/generate-images.js` (requires Playwright).

## Architecture

- The extension never changes the text. In pixel mode, one decoration type makes the matched letter `transparent` and draws an SVG over it through a `before` attachment, using negative margins so the attachment has zero net width. This keeps the cursor, selection and column alignment intact. Font mode (`quakeQ.fontFamily`) instead injects `font-family` through the `textDecoration` CSS hack, because the decoration API has no font option.
- `rebuild()` disposes everything and recreates it from scratch. It runs on activation and on any change to `quakeQ.*` or `editor.*`, because the glyph size depends on `editor.fontSize`, `editor.lineHeight` and `editor.letterSpacing` (see `editorMetrics()`).
- `q` and `Q` share a single decoration type. The image is chosen for each range through `renderOptions`.
- SVGs are written to `context.globalStorageUri` and named after a content hash, because `contentIconPath` needs a file URI.
- Only the visible ranges plus a 20-line margin are decorated. Updates are debounced by 50 ms.
- `src/glyph.js` is pure and does not depend on `vscode`. Each glyph is a `#`/`.` grid with an `ascent` (the rows above the baseline). `buildSvg` sizes the pixels so the glyph never leaves the line. `scripts/generate-images.js` reuses `buildSvg` and copies the overlay math from `pixelRenderOptions()`, so keep the two in sync.

## Settings

- When adding or changing a setting, update all three places: `package.json` `contributes.configuration`, the fallback default in `src/extension.js` (defaults are duplicated there, e.g. colors and `scale`), and the settings table in `README.md`.
- Renaming or removing a setting is a breaking change (see the commit rules above).
