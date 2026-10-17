import "./index.css";
import { Composition, Folder } from "remotion";
import {
  calcularReelClips,
  esquemaReelClips,
  ReelClips,
} from "./plantillas/ReelClips";
import {
  calcularReelHablando,
  esquemaReelHablando,
  ReelHablando,
} from "./plantillas/ReelHablando";
import {
  DURACION_PROMO,
  esquemaReelPromo,
  ReelPromo,
} from "./plantillas/ReelPromo";

// Cada cliente tiene su carpeta con las 3 plantillas de reel (1080x1920, vertical).
// Cambia los textos y archivos desde el panel derecho de Remotion Studio,
// o aquí mismo en defaultProps.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Sabrina-Hejda">
        <Composition
          id="Sabrina-Hablando"
          component={ReelHablando}
          schema={esquemaReelHablando}
          calculateMetadata={calcularReelHablando}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "sabrina",
            video: "ejemplos/hablando.mp4",
            subtitulos: "subtitulos/ejemplo.json",
            gancho: "3 claves para sentirte mejor",
            segundosGancho: 3,
            llamadaFinal: "Seguime para más",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="Sabrina-Clips"
          component={ReelClips}
          schema={esquemaReelClips}
          calculateMetadata={calcularReelClips}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "sabrina",
            escenas: [
              {
                archivo: "ejemplos/clip1.mp4",
                tipo: "video",
                texto: "Tu bienestar empieza hoy",
                segundos: 3,
              },
              {
                archivo: "ejemplos/producto.jpg",
                tipo: "foto",
                texto: "Escucharte es el primer paso",
                segundos: 3,
              },
              {
                archivo: "ejemplos/clip3.mp4",
                tipo: "video",
                texto: "Te acompaño en el proceso",
                segundos: 3,
              },
            ],
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
            llamadaFinal: "Reservá tu sesión",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="Sabrina-Promo"
          component={ReelPromo}
          schema={esquemaReelPromo}
          durationInFrames={DURACION_PROMO}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "sabrina",
            etiqueta: "NUEVO",
            titulo: "Sesión de coaching individual",
            foto: "ejemplos/producto.jpg",
            precioAntes: "",
            precioAhora: "$35.000",
            detalle: "Primera sesión online",
            llamadaFinal: "Escribime por DM",
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
          }}
        />
      </Folder>
      <Folder name="JuanMa-Pizarro">
        <Composition
          id="JuanMa-Hablando"
          component={ReelHablando}
          schema={esquemaReelHablando}
          calculateMetadata={calcularReelHablando}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "juanma",
            video: "ejemplos/hablando.mp4",
            subtitulos: "subtitulos/ejemplo.json",
            gancho: "¿Te cuesta frenar la mente?",
            segundosGancho: 3,
            llamadaFinal: "Seguime para más",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="JuanMa-Clips"
          component={ReelClips}
          schema={esquemaReelClips}
          calculateMetadata={calcularReelClips}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "juanma",
            escenas: [
              {
                archivo: "ejemplos/clip1.mp4",
                tipo: "video",
                texto: "La calma también se entrena",
                segundos: 3,
              },
              {
                archivo: "ejemplos/producto.jpg",
                tipo: "foto",
                texto: "Pequeños hábitos, grandes cambios",
                segundos: 3,
              },
              {
                archivo: "ejemplos/clip3.mp4",
                tipo: "video",
                texto: "Estoy para ayudarte",
                segundos: 3,
              },
            ],
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
            llamadaFinal: "Agendá tu consulta",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="JuanMa-Promo"
          component={ReelPromo}
          schema={esquemaReelPromo}
          durationInFrames={DURACION_PROMO}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "juanma",
            etiqueta: "TALLER ONLINE",
            titulo: "Manejo de la ansiedad",
            foto: "ejemplos/producto.jpg",
            precioAntes: "",
            precioAhora: "$25.000",
            detalle: "Cupos limitados",
            llamadaFinal: "Inscribite por DM",
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
          }}
        />
      </Folder>
      <Folder name="Mujer-Bonita">
        <Composition
          id="MujerBonita-Hablando"
          component={ReelHablando}
          schema={esquemaReelHablando}
          calculateMetadata={calcularReelHablando}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "mujerBonita",
            video: "ejemplos/hablando.mp4",
            subtitulos: "subtitulos/ejemplo.json",
            gancho: "Los accesorios del momento",
            segundosGancho: 3,
            llamadaFinal: "Seguinos para más",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="MujerBonita-Clips"
          component={ReelClips}
          schema={esquemaReelClips}
          calculateMetadata={calcularReelClips}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "mujerBonita",
            escenas: [
              {
                archivo: "ejemplos/clip1.mp4",
                tipo: "video",
                texto: "Nueva colección",
                segundos: 3,
              },
              {
                archivo: "ejemplos/producto.jpg",
                tipo: "foto",
                texto: "Detalles que brillan",
                segundos: 3,
              },
              {
                archivo: "ejemplos/clip3.mp4",
                tipo: "video",
                texto: "Envíos a todo el país",
                segundos: 3,
              },
            ],
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
            llamadaFinal: "Comprá por DM",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="MujerBonita-Promo"
          component={ReelPromo}
          schema={esquemaReelPromo}
          durationInFrames={DURACION_PROMO}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "mujerBonita",
            etiqueta: "OFERTA",
            titulo: "Aros dorados",
            foto: "ejemplos/producto.jpg",
            precioAntes: "$15.900",
            precioAhora: "$12.900",
            detalle: "Envíos a todo el país",
            llamadaFinal: "Pedí el tuyo por DM",
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
          }}
        />
      </Folder>
      <Folder name="Muebles-Salvador">
        <Composition
          id="MueblesSalvador-Hablando"
          component={ReelHablando}
          schema={esquemaReelHablando}
          calculateMetadata={calcularReelHablando}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "mueblesSalvador",
            video: "ejemplos/hablando.mp4",
            subtitulos: "subtitulos/ejemplo.json",
            gancho: "Así quedó este placard a medida",
            segundosGancho: 3,
            llamadaFinal: "Seguinos para más",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="MueblesSalvador-Clips"
          component={ReelClips}
          schema={esquemaReelClips}
          calculateMetadata={calcularReelClips}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "mueblesSalvador",
            escenas: [
              {
                archivo: "ejemplos/clip1.mp4",
                tipo: "video",
                texto: "Diseñamos a tu medida",
                segundos: 3,
              },
              {
                archivo: "ejemplos/producto.jpg",
                tipo: "foto",
                texto: "Melamina de primera calidad",
                segundos: 3,
              },
              {
                archivo: "ejemplos/clip3.mp4",
                tipo: "video",
                texto: "Instalación incluida",
                segundos: 3,
              },
            ],
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
            llamadaFinal: "Pedí tu presupuesto",
            segundosCierre: 3,
          }}
        />
        <Composition
          id="MueblesSalvador-Promo"
          component={ReelPromo}
          schema={esquemaReelPromo}
          durationInFrames={DURACION_PROMO}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            marca: "mueblesSalvador",
            etiqueta: "PROMO DEL MES",
            titulo: "Placard a medida",
            foto: "ejemplos/producto.jpg",
            precioAntes: "$450.000",
            precioAhora: "$380.000",
            detalle: "Hasta 6 cuotas sin interés",
            llamadaFinal: "Pedí tu presupuesto",
            musica: "ejemplos/musica.mp3",
            volumenMusica: 0.5,
          }}
        />
      </Folder>
    </>
  );
};
