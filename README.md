# Quake Q

A Visual Studio Code extension that replaces **only the letter `q`** in the editor with the **Quake 1** icon (the ring with the nail through it), in a bronze gradient. The rest of the text is unchanged.

```
const query = equal(Quake, q);
      ^             ^      ^   ← these letters are drawn as the Quake icon
```

## How it works

- **Icon mode (default):** the extension ships the Quake 1 logo as a vector icon. The real letter is made transparent and the icon is drawn on top of it: small for `q` (x-height) and large for `Q` (cap height), with the nail hanging below the baseline like the letter's tail. The cursor, selection, copy/paste and column alignment are unaffected, because the text itself doesn't change.
- **Font mode (optional):** if you have a Quake font installed on your system (for example *DpQuake*), set its name in `quakeQ.fontFamily` and the `q` will be rendered with that font instead of the icon.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `quakeQ.enabled` | `true` | Turns the effect on or off. |
| `quakeQ.includeUppercase` | `true` | Also applies the effect to `Q` (drawn larger than `q`). |
| `quakeQ.color` | `#d8b070` | Top color of the gradient. |
| `quakeQ.shadowColor` | `#7a4a20` | Bottom color of the gradient. |
| `quakeQ.iconScale` | `1` | Icon size relative to the letter it replaces (capped at the line height). |
| `quakeQ.verticalOffset` | `0` | Vertical adjustment in pixels if the icon doesn't line up with your font. |
| `quakeQ.fontFamily` | `""` | Installed Quake font to use instead of the icon. |

Command: **Quake Q: Toggle** (`quakeQ.toggle`).

## Install from source

```sh
npx @vscode/vsce package
code --install-extension quake-q-0.1.0.vsix
```

Or open this folder in VS Code and press `F5` to try it in an Extension Development Host window.

## Notes

- The icon is the Quake 1 logo, taken from [Wikimedia](https://upload.wikimedia.org/wikipedia/de/1/1f/Quake1.svg). Quake and its logo are trademarks of id Software.
- Only visible lines are decorated, so it performs well on large files.
