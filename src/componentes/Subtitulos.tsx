import type { Caption, TikTokPage } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import type { Marca } from "../marcas";

// Cada cuántos milisegundos cambia el bloque de subtítulos (más alto = más palabras a la vez)
const CAMBIAR_CADA_MS = 1200;

const PaginaSubtitulo: React.FC<{
  readonly pagina: TikTokPage;
  readonly marca: Marca;
}> = ({ pagina, marca }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tiempoMs = pagina.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 560,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          fontFamily: marca.fuenteTexto,
          fontWeight: 800,
          fontSize: 84,
          lineHeight: 1.2,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          color: "white",
          textShadow: "0 4px 18px rgba(0,0,0,0.65)",
          scale: interpolate(frame, [0, 6], [0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {pagina.tokens.map((token, i) => {
          const activa = token.fromMs <= tiempoMs && token.toMs > tiempoMs;
          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                color: activa ? marca.colores.acento : "white",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Lee un archivo JSON de subtítulos (formato Caption de Remotion) desde public/
export const Subtitulos: React.FC<{
  readonly archivo: string;
  readonly marca: Marca;
}> = ({ archivo, marca }) => {
  const [subtitulos, setSubtitulos] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Cargando subtítulos"));
  const { fps } = useVideoConfig();

  const cargar = useCallback(async () => {
    try {
      const respuesta = await fetch(staticFile(archivo));
      setSubtitulos(await respuesta.json());
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [archivo, continueRender, cancelRender, handle]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const paginas = useMemo(() => {
    if (!subtitulos) {
      return [];
    }
    return createTikTokStyleCaptions({
      captions: subtitulos,
      combineTokensWithinMilliseconds: CAMBIAR_CADA_MS,
    }).pages;
  }, [subtitulos]);

  return (
    <AbsoluteFill>
      {paginas.map((pagina, i) => {
        const siguiente = paginas[i + 1] ?? null;
        const inicio = (pagina.startMs / 1000) * fps;
        const fin = Math.min(
          siguiente ? (siguiente.startMs / 1000) * fps : Infinity,
          inicio + (CAMBIAR_CADA_MS / 1000) * fps,
        );
        if (fin - inicio <= 0) {
          return null;
        }
        return (
          <Sequence
            key={i}
            name={`Subtítulo ${i + 1}`}
            from={inicio}
            durationInFrames={fin - inicio}
          >
            <PaginaSubtitulo pagina={pagina} marca={marca} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
