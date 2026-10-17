import { Video } from "@remotion/media";
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { LogoMarca } from "../componentes/LogoMarca";
import { Subtitulos } from "../componentes/Subtitulos";
import { TarjetaCierre } from "../componentes/TarjetaCierre";
import { marcas, zMarca } from "../marcas";

export const esquemaReelHablando = z.object({
  marca: zMarca,
  // Ruta del vídeo dentro de public/
  video: z.string(),
  // Ruta del JSON de subtítulos dentro de public/ (vacío = sin subtítulos)
  subtitulos: z.string(),
  gancho: z.string(),
  segundosGancho: z.number().min(0),
  llamadaFinal: z.string(),
  segundosCierre: z.number().min(0),
});

type Props = z.infer<typeof esquemaReelHablando>;

const FPS = 30;

// La duración del reel se ajusta sola al vídeo + la tarjeta de cierre
export const calcularReelHablando: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(staticFile(props.video)),
  });
  const segundos = await input.computeDuration();
  return {
    durationInFrames: Math.ceil((segundos + props.segundosCierre) * FPS),
  };
};

export const ReelHablando: React.FC<Props> = (props) => {
  const marca = marcas[props.marca];
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const framesCierre = Math.round(props.segundosCierre * fps);
  const framesVideo = durationInFrames - framesCierre;
  const framesGancho = Math.round(props.segundosGancho * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence name="Vídeo" durationInFrames={framesVideo}>
        <Video
          src={staticFile(props.video)}
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <AbsoluteFill
          name="Degradado"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        {props.subtitulos ? (
          <Subtitulos archivo={props.subtitulos} marca={marca} />
        ) : null}
        <Interactive.Div
          name="Logo"
          style={{ position: "absolute", top: 110, right: 80 }}
        >
          <LogoMarca marca={marca} tamano={130} />
        </Interactive.Div>
      </Sequence>

      {framesGancho > 0 && props.gancho ? (
        <Sequence name="Gancho" durationInFrames={framesGancho}>
          <AbsoluteFill
            style={{
              alignItems: "center",
              paddingTop: 300,
              paddingLeft: 80,
              paddingRight: 80,
            }}
          >
            <Interactive.Div
              name="Texto gancho"
              style={{
                fontFamily: marca.fuenteTitulos,
                fontWeight: 700,
                fontSize: 88,
                lineHeight: 1.15,
                textAlign: "center",
                color: marca.colores.textoSobrePrincipal,
                backgroundColor: marca.colores.principal,
                padding: "32px 48px",
                borderRadius: 32,
                boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                scale: interpolate(frame, [0, 12], [0.7, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 14 }),
                  output: "perceptual-scale",
                }),
                opacity: interpolate(
                  frame,
                  [0, 6, framesGancho - 8, framesGancho],
                  [0, 1, 1, 0],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                ),
              }}
            >
              {props.gancho}
            </Interactive.Div>
          </AbsoluteFill>
        </Sequence>
      ) : null}

      {framesCierre > 0 ? (
        <Sequence name="Cierre" from={framesVideo}>
          <TarjetaCierre marca={marca} llamada={props.llamadaFinal} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
