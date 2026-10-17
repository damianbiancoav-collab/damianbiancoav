import { Img, staticFile } from "remotion";
import type { Marca } from "../marcas";

// Muestra el logo del cliente; si todavía no hay logo, un círculo con sus iniciales.
export const LogoMarca: React.FC<{
  readonly marca: Marca;
  readonly tamano: number;
}> = ({ marca, tamano }) => {
  if (marca.logo) {
    return (
      <Img
        src={staticFile(marca.logo)}
        style={{ width: tamano, height: tamano, objectFit: "contain" }}
      />
    );
  }

  return (
    <div
      style={{
        width: tamano,
        height: tamano,
        borderRadius: "50%",
        backgroundColor: marca.colores.principal,
        color: marca.colores.textoSobrePrincipal,
        border: `${tamano * 0.04}px solid ${marca.colores.acento}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: marca.fuenteTitulos,
        fontWeight: 700,
        fontSize: tamano / Math.max(2.2, marca.iniciales.length * 0.95),
        boxSizing: "border-box",
      }}
    >
      {marca.iniciales}
    </div>
  );
};
