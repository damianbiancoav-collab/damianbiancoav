import { Audio, Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Fragment } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
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

export const esquemaReelClips = z.object({
  marca: zMarca,
  escenas: z.array(
    z.object({
      // Ruta dentro de public/ de un vídeo (.mp4, .mov) o una foto (.jpg, .png)
      archivo: z.string(),
      tipo: z.enum(["video", "foto"]),
      texto: z.string(),
      segundos: z.number().min(0.5),
    }),
  ),
  // Ruta de la música dentro de public/ (vacío = sin música)
  musica: z.string(),
  volumenMusica: z.number().min(0).max(1),
  llamadaFinal: z.string(),
  segundosCierre: z.number().min(0),
});

type Props = z.infer<typeof esquemaReelClips>;

const FPS = 30;
const FRAMES_TRANSICION = 12;
const transicion = linearTiming({ durationInFrames: FRAMES_TRANSICION });

export const calcularReelClips: CalculateMetadataFunction<Props> = ({
  props,
}) => {
  const framesEscenas = props.escenas.reduce(
    (total, e) => total + Math.round(e.segundos * FPS),
    0,
  );
  const framesCierre = Math.round(props.segundosCierre * FPS);
  const numTransiciones =
    Math.max(0, props.escenas.length - 1) + (framesCierre > 0 ? 1 : 0);
  return {
    durationInFrames: Math.max(
      1,
      framesEscenas + framesCierre - numTransiciones * FRAMES_TRANSICION,
    ),
  };
};

const Escena: React.FC<{
  readonly escena: Props["escenas"][number];
  readonly marca: Marca;
}> = ({ escena, marca }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: marca.colores.fondo }}>
      {escena.tipo === "video" ? (
        <Video
          src={staticFile(escena.archivo)}
          loop
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Img
          src={staticFile(escena.archivo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // Zoom lento sobre la foto
            scale: interpolate(frame, [0, durationInFrames], [1, 1.12], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      )}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {escena.texto ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 480,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          <Interactive.Div
            name="Texto escena"
            style={{
              fontFamily: marca.fuenteTitulos,
              fontWeight: 700,
              fontSize: 92,
              lineHeight: 1.15,
              textAlign: "center",
              color: "white",
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
              translate: interpolate(frame, [6, 24], ["0px 80px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              opacity: interpolate(frame, [6, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {escena.texto}
            <div
              style={{
                height: 10,
                width: 180,
                margin: "28px auto 0",
                borderRadius: 5,
                backgroundColor: marca.colores.acento,
              }}
            />
          </Interactive.Div>
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", top: 110, right: 80 }}>
        <LogoMarca marca={marca} tamano={130} />
      </div>
    </AbsoluteFill>
  );
};

export const ReelClips: React.FC<Props> = (props) => {
  const marca = marcas[props.marca];
  const { fps } = useVideoConfig();
  const framesCierre = Math.round(props.segundosCierre * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries>
        {props.escenas.map((escena, i) => (
          <Fragment key={i}>
            {i > 0 ? (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={transicion}
              />
            ) : null}
            <TransitionSeries.Sequence
              name={`Escena ${i + 1}`}
              durationInFrames={Math.round(escena.segundos * fps)}
            >
              <Escena escena={escena} marca={marca} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
        {framesCierre > 0 ? (
          <>
            <TransitionSeries.Transition
              presentation={fade()}
              timing={transicion}
            />
            <TransitionSeries.Sequence
              name="Cierre"
              durationInFrames={framesCierre}
            >
              <TarjetaCierre marca={marca} llamada={props.llamadaFinal} />
            </TransitionSeries.Sequence>
          </>
        ) : null}
      </TransitionSeries>
      {props.musica ? (
        <Audio src={staticFile(props.musica)} volume={props.volumenMusica} />
      ) : null}
    </AbsoluteFill>
  );
};
