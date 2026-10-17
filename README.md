# Reels para clientes (Remotion)

Plantillas de reels verticales (1080x1920) para Instagram, con la marca de cada cliente.

## Clientes

| Cliente | Carpeta en Studio |
| --- | --- |
| Sabrina Hejda (Coach y Psicóloga) | `Sabrina-Hejda` |
| JuanMa Pizarro CAI (Terapeuta) | `JuanMa-Pizarro` |
| Mujer Bonita (Accesorios) | `Mujer-Bonita` |
| Muebles Salvador (Melamina) | `Muebles-Salvador` |

Colores, tipografías, logo y usuario de Instagram de cada uno están en `src/marcas.ts`.
**Ahora mismo son provisionales**: hay que reemplazarlos por los reales.

## Plantillas

- **Hablando**: vídeo de una persona hablando + subtítulos automáticos + gancho inicial + logo + cierre.
- **Clips**: varias escenas (vídeos o fotos) con texto, transiciones, música y cierre.
- **Promo**: etiqueta + título, foto con precio (y precio anterior tachado) y cierre con llamada a la acción.

## Uso diario

1. Instalar (solo la primera vez): `npm i`
2. Abrir el editor: `npm run dev` → http://localhost:3000
3. Copiar tus vídeos, fotos y música a `public/videos/`.
4. En Studio, elegir cliente y plantilla, y cambiar textos y archivos en el panel derecho
   (las rutas son relativas a `public/`, ej. `videos/reel-lunes.mp4`).
5. Exportar con el botón **Render** de Studio, o por terminal:
   `npx remotion render Sabrina-Hablando out/reel.mp4`

## Subtítulos automáticos

```
npm run subtitular -- public/videos/reel-lunes.mp4
```

Crea `public/subtitulos/reel-lunes.json`. Luego, en la plantilla **Hablando**, poner
`subtitulos/reel-lunes.json`. La primera vez descarga el modelo de voz (~500 MB).

## Logos

Guardar el logo (PNG con fondo transparente) en `public/logos/` y poner su ruta en
`src/marcas.ts`, por ejemplo `logo: "logos/sabrina.png"`. Sin logo se muestran las iniciales.

## Licencia de Remotion

Remotion es gratis para personas y empresas de hasta 3 empleados.
Ver https://www.remotion.dev/license
