// Fichas de marca de cada cliente.
// Para cambiar colores, tipografías o logo de un cliente, edita solo este archivo.
// Los colores y fuentes actuales son PROVISIONALES hasta tener los datos reales.

import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { z } from "zod";

// Las tipografías están guardadas en public/fuentes/ para que funcionen sin internet.
// Para añadir una nueva, descarga el .woff2 en esa carpeta y regístrala aquí.
const cargar = (familia: string, pesos: string[]) => {
  for (const peso of pesos) {
    loadFont({
      family: familia,
      url: staticFile(`fuentes/${familia}-${peso}.woff2`),
      weight: peso,
    });
  }
  return familia;
};

const fuentes = {
  playfair: cargar("PlayfairDisplay", ["700"]),
  lora: cargar("Lora", ["700"]),
  dmSerif: cargar("DMSerifDisplay", ["400"]),
  montserrat: cargar("Montserrat", ["600", "800"]),
  inter: cargar("Inter", ["500", "800"]),
  nunito: cargar("Nunito", ["600", "800"]),
  poppins: cargar("Poppins", ["500", "800"]),
};

export type Marca = {
  nombre: string;
  // Texto corto que se muestra si todavía no hay logo (ej. "SH")
  iniciales: string;
  // Ruta dentro de public/ (ej. "logos/sabrina.png"), o null si aún no hay logo
  logo: string | null;
  usuario: string;
  colores: {
    fondo: string;
    principal: string;
    acento: string;
    texto: string;
    // Color del texto sobre el color principal
    textoSobrePrincipal: string;
  };
  fuenteTitulos: string;
  fuenteTexto: string;
};

export const marcas = {
  sabrina: {
    nombre: "Sabrina Hejda",
    iniciales: "SH",
    logo: null,
    usuario: "@sabrinahejda",
    colores: {
      fondo: "#F6EEE6",
      principal: "#B5654A",
      acento: "#E9C46A",
      texto: "#3B2A24",
      textoSobrePrincipal: "#FFFFFF",
    },
    fuenteTitulos: fuentes.playfair,
    fuenteTexto: fuentes.inter,
  },
  juanma: {
    nombre: "JuanMa Pizarro",
    iniciales: "CAI",
    logo: null,
    usuario: "@juanmapizarro",
    colores: {
      fondo: "#EEF2EE",
      principal: "#4F6D5E",
      acento: "#9CC5B0",
      texto: "#1F2E3A",
      textoSobrePrincipal: "#FFFFFF",
    },
    fuenteTitulos: fuentes.lora,
    fuenteTexto: fuentes.nunito,
  },
  mujerBonita: {
    nombre: "Mujer Bonita",
    iniciales: "MB",
    logo: null,
    usuario: "@mujerbonita",
    colores: {
      fondo: "#FBEFF2",
      principal: "#C2185B",
      acento: "#D4AF37",
      texto: "#3A1426",
      textoSobrePrincipal: "#FFFFFF",
    },
    fuenteTitulos: fuentes.dmSerif,
    fuenteTexto: fuentes.poppins,
  },
  mueblesSalvador: {
    nombre: "Muebles Salvador",
    iniciales: "MS",
    logo: null,
    usuario: "@mueblessalvador",
    colores: {
      fondo: "#F2EDE6",
      principal: "#2F2F2F",
      acento: "#B07A4A",
      texto: "#232323",
      textoSobrePrincipal: "#FFFFFF",
    },
    fuenteTitulos: fuentes.montserrat,
    fuenteTexto: fuentes.inter,
  },
} satisfies Record<string, Marca>;

export type IdMarca = keyof typeof marcas;

export const zMarca = z.enum(
  Object.keys(marcas) as [IdMarca, ...IdMarca[]],
);
