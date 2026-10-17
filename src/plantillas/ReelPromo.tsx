import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { LogoMarca } from "../componentes/LogoMarca";
import { TarjetaCierre } from "../componentes/TarjetaCierre";
import { Marca, marcas, zMarca } from "../marcas";

export const esquemaReelPromo = z.object({
  marca: zMarca,
  etiqueta: z.string(),
  titulo: z.string(),
  // Ruta de la foto del producto/servicio dentro de public/
  foto: z.string(),
  // Vacío = no se muestra precio tachado
  precioAntes: z.string(),
  precioAhora: z.string(),
  detalle: z.string(),
  llamadaFinal: z.string(),
  musica: z.string(),
  volumenMusica: z.number().min(0).max(1),
});

type Props = z.infer<typeof esquemaReelPromo>;

// Duración de cada parte en frames (30 fps)
export const FRAMES_INTRO = 90;
export const FRAMES_PRODUCTO = 150;
export const FRAMES_CIERRE = 120;
export const FRAMES_TRANSICION = 15;
export const DURACION_PROMO =
  FRAMES_INTRO + FRAMES_PRODUCTO + FRAMES_CIERRE - 2 * FRAMES_TRANSICION;

const transicion = linearTiming({
  durationInFrames: FRAMES_TRANSICION,
  easing: Easing.bezier(0.65, 0, 0.35, 1),
});

const Intro: React.FC<{ readonly marca: Marca; readonly props: Props }> = ({
  marca,
  props,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: marca.colores.fondo,
        justifyContent: "center",
        alignItems: "center",
        gap: 56,
        padding: 100,
        textAlign: "center",
      }}
    >
      <Interactive.Div
        name="Etiqueta"
        style={{
          fontFamily: marca.fuenteTexto,
          fontWeight: 800,
          fontSize: 60,
          letterSpacing: 6,
          color: marca.colores.textoSobrePrincipal,
          backgroundColor: marca.colores.principal,
          padding: "20px 52px",
          borderRadius: 999,
          scale: interpolate(frame, [0, 15], [0.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
            output: "perceptual-scale",
          }),
        }}
      >
        {props.etiqueta}
      </Interactive.Div>
      <Interactive.Div
        name="Título"
        style={{
          fontFamily: marca.fuenteTitulos,
          fontWeight: 700,
          fontSize: 120,
          lineHeight: 1.05,
          color: marca.colores.texto,
          translate: interpolate(frame, [10, 30], ["0px 80px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [10, 26], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {props.titulo}
      </Interactive.Div>
      <div style={{ position: "absolute", top: 110, right: 80 }}>
        <LogoMarca marca={marca} tamano={130} />
      </div>
    </AbsoluteFill>
  );
};

const Producto: React.FC<{ readonly marca: Marca; readonly props: Props }> = ({
  marca,
  props,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: marca.colores.fondo }}>
      <Img
        src={staticFile(props.foto)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, durationInFrames], [1.05, 1.15], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 420,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        <Interactive.Div
          name="Tarjeta precio"
          style={{
            backgroundColor: marca.colores.fondo,
            borderRadius: 40,
            padding: "48px 64px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            borderTop: `14px solid ${marca.colores.acento}`,
            translate: interpolate(frame, [8, 28], ["0px 300px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          {props.precioAntes ? (
            <div
              style={{
                fontFamily: marca.fuenteTexto,
                fontWeight: 500,
                fontSize: 56,
                color: marca.colores.texto,
                opacity: 0.6,
                textDecoration: "line-through",
              }}
            >
              {props.precioAntes}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: marca.fuenteTitulos,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 1.1,
              color: marca.colores.principal,
              scale: interpolate(frame, [24, 40], [0.6, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 9 }),
                output: "perceptual-scale",
              }),
            }}
          >
            {props.precioAhora}
          </div>
          {props.detalle ? (
            <div
              style={{
                fontFamily: marca.fuenteTexto,
                fontWeight: 500,
                fontSize: 48,
                color: marca.colores.texto,
                marginTop: 12,
              }}
            >
              {props.detalle}
            </div>
          ) : null}
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ReelPromo: React.FC<Props> = (props) => {
  const marca = marcas[props.marca];

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Intro" durationInFrames={FRAMES_INTRO}>
          <Intro marca={marca} props={props} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={transicion}
        />
        <TransitionSeries.Sequence
          name="Producto"
          durationInFrames={FRAMES_PRODUCTO}
        >
          <Producto marca={marca} props={props} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={transicion}
        />
        <TransitionSeries.Sequence name="Cierre" durationInFrames={FRAMES_CIERRE}>
          <TarjetaCierre marca={marca} llamada={props.llamadaFinal} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {props.musica ? (
        <Audio src={staticFile(props.musica)} volume={props.volumenMusica} />
      ) : null}
    </AbsoluteFill>
  );
};
