# CLAUDE.md

## Git commits

- Author and committer: `Joan Rueda <joanruedapau@gmail.com>`. Before committing, set it in the repository config:
  `git config user.name "Joan Rueda" && git config user.email "joanruedapau@gmail.com"`
- Do not add trailer lines to commit messages: no `Co-Authored-By:`, no `Claude-Session:`, nor any other attribution line.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `<type>(<optional scope>): <description>`.
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  - Description in English, imperative mood, lowercase, no trailing period, e.g. `feat(glyph): round the q ring`.
  - Breaking changes (such as renaming or removing a setting) use `!` after the type/scope and a `BREAKING CHANGE:` footer explaining it.

## Project

- VS Code extension, plain JavaScript with no build step: `src/extension.js` (decorations and settings) and `src/glyph.js` (pixel-art glyphs).
- Everything in the repository is written in English.
- After changing a glyph, regenerate `images/icon.png` and `images/screenshot.png` with `node scripts/generate-images.js` (requires Playwright).
- Check packaging with `npx @vscode/vsce ls`.
