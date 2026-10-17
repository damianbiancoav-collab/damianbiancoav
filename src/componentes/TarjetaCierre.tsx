import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import type { Marca } from "../marcas";
import { LogoMarca } from "./LogoMarca";

// Pantalla final con logo, nombre, usuario de Instagram y llamada a la acción
export const TarjetaCierre: React.FC<{
  readonly marca: Marca;
  readonly llamada: string;
}> = ({ marca, llamada }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Cierre"
      style={{
        backgroundColor: marca.colores.principal,
        justifyContent: "center",
        alignItems: "center",
        gap: 48,
        padding: 100,
        textAlign: "center",
      }}
    >
      <Interactive.Div
        name="Logo"
        style={{
          scale: interpolate(frame, [0, 18], [0.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <LogoMarca marca={marca} tamano={300} />
      </Interactive.Div>
      <Interactive.Div
        name="Nombre"
        style={{
          fontFamily: marca.fuenteTitulos,
          fontWeight: 700,
          fontSize: 96,
          color: marca.colores.textoSobrePrincipal,
          opacity: interpolate(frame, [8, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {marca.nombre}
      </Interactive.Div>
      <Interactive.Div
        name="Llamada"
        style={{
          fontFamily: marca.fuenteTexto,
          fontWeight: 800,
          fontSize: 56,
          color: marca.colores.principal,
          backgroundColor: marca.colores.acento,
          padding: "24px 48px",
          borderRadius: 999,
          translate: interpolate(frame, [14, 30], ["0px 60px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [14, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {llamada}
      </Interactive.Div>
      <Interactive.Div
        name="Usuario"
        style={{
          fontFamily: marca.fuenteTexto,
          fontWeight: 500,
          fontSize: 48,
          color: marca.colores.textoSobrePrincipal,
          opacity: interpolate(frame, [22, 36], [0, 0.9], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {marca.usuario}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
