# Quake Q

Extensión de Visual Studio Code que cambia **solo la letra `q`** del editor para que se vea con el estilo de la tipografía de **Quake 1**: pixelada, con trazos gruesos y un degradado bronce. El resto del texto no cambia.

```
const query = equal(Quake, q);
      ^             ^      ^   ← estas letras se dibujan al estilo Quake
```

## Cómo funciona

- **Modo pixel (por defecto):** la extensión lleva un glifo `q` / `Q` en pixel art inspirado en la fuente de consola de Quake 1. La letra real se vuelve transparente y el glifo se dibuja encima. El cursor, la selección, copiar/pegar y la alineación de columnas siguen igual, porque el texto no cambia.
- **Modo fuente (opcional):** si tienes instalada una fuente de Quake en el sistema (por ejemplo, *DpQuake*), pon su nombre en `quakeQ.fontFamily` y la `q` se mostrará con esa fuente.

## Ajustes

| Ajuste | Valor por defecto | Descripción |
| --- | --- | --- |
| `quakeQ.enabled` | `true` | Activa o desactiva el efecto. |
| `quakeQ.includeUppercase` | `true` | Aplica el efecto también a `Q`. |
| `quakeQ.color` | `#d8b070` | Color superior del degradado. |
| `quakeQ.shadowColor` | `#7a4a20` | Color inferior del degradado. |
| `quakeQ.verticalOffset` | `0` | Ajuste vertical en píxeles si el glifo no queda alineado con tu fuente. |
| `quakeQ.fontFamily` | `""` | Fuente de Quake instalada que se usará en lugar del glifo pixelado. |

Comando: **Quake Q: Activar/desactivar** (`quakeQ.toggle`).

## Instalar desde el código

```sh
npx @vscode/vsce package
code --install-extension quake-q-0.1.0.vsix
```

O abre esta carpeta en VS Code y pulsa `F5` para probarla en una ventana de desarrollo.

## Notas

- El glifo es un dibujo original inspirado en Quake; no incluye recursos de id Software.
- Solo se decoran las líneas visibles, así que funciona bien con archivos grandes.
