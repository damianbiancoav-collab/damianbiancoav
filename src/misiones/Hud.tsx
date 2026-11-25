import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T } from "./tiempos";

const fuentes = [
  ["Montserrat", "800"],
  ["Inter", "500"],
  ["Inter", "800"],
] as const;
for (const [familia, peso] of fuentes) {
  loadFont({
    family: familia,
    url: staticFile(`fuentes/${familia}-${peso}.woff2`),
    weight: peso,
  });
}

const ORO = "#f2c14e";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const aparece = (f: number, inicio: number, fin: number, dur = 10) =>
  interpolate(f, [inicio, inicio + dur, fin - dur, fin], [0, 1, 1, 0], clamp);

const etiqueta: React.CSSProperties = {
  fontFamily: "Inter",
  fontWeight: 800,
  fontSize: 22,
  letterSpacing: 4,
  textTransform: "uppercase",
  textShadow: "0 2px 6px rgba(0,0,0,.7)",
};

// ---------- Objetivo de misión ----------
const Objetivo: React.FC<{ f: number }> = ({ f }) => {
  const segunda = f >= T.llegada;
  const texto = segunda ? "Ayuda al herido" : "Recorre el camino a Jericó";
  const hecho = f >= T.boton + 40;
  const cambio = interpolate(f, [T.llegada, T.llegada + 8], [0.6, 1], clamp);
  const progreso = hecho ? 2 : segunda ? 1 : 0;
  const visible = interpolate(f, [70, 82, T.cumplida - 5, T.cumplida], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 230, left: 60, opacity: visible }}>
      <div style={{ ...etiqueta, color: ORO, fontSize: 20 }}>Parábola 1 de 12</div>
      <div
        style={{
          marginTop: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 22px",
          background: "rgba(10,8,6,.72)",
          borderLeft: `5px solid ${ORO}`,
          transform: `scale(${segunda ? cambio : 1})`,
          transformOrigin: "left center",
        }}
      >
        <span style={{ color: hecho ? "#7fdc7f" : ORO, fontSize: 30 }}>
          {hecho ? "✓" : "◆"}
        </span>
        <span
          style={{
            fontFamily: "Inter",
            fontWeight: 800,
            fontSize: 34,
            color: "white",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {texto}
        </span>
      </div>
      <div style={{ ...etiqueta, color: "#efe6d2", marginTop: 12, fontSize: 18 }}>
        Compasión{" "}
        <span style={{ color: ORO, letterSpacing: 6 }}>
          {"●".repeat(progreso)}
          {"○".repeat(3 - progreso)}
        </span>
      </div>
    </div>
  );
};

// ---------- Minimapa ----------
const Minimapa: React.FC<{ f: number }> = ({ f }) => {
  // misma trayectoria que en la escena 3D (aprox.)
  const zJ = interpolate(f, [0, T.llegada - 40, T.llegada], [0, -19.6, -22.6], clamp);
  const escala = 6; // px por unidad
  const zHerido = -24;
  const yH = 150 + (zHerido - zJ) * escala;
  const pulso = 1 + Math.sin(f * 0.25) * 0.15;
  const visible = interpolate(f, [70, 85, T.cumplida - 5, T.cumplida], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 1180,
        display: "flex",
        alignItems: "flex-end",
        gap: 22,
        opacity: visible,
      }}
    >
      <svg width={300} height={300} style={{ borderRadius: 18, overflow: "hidden" }}>
        <rect width={300} height={300} fill="#d9bf8f" />
        {/* colinas */}
        <path d="M0 0 L70 0 C60 90 80 180 55 300 L0 300 Z" fill="#c4a171" />
        <path d="M300 0 L230 0 C245 100 215 200 240 300 L300 300 Z" fill="#c4a171" />
        {/* camino */}
        <rect x={140} y={0} width={20} height={300} fill="#f1e2c0" />
        {/* Jericó al norte */}
        <text
          x={150}
          y={28 + Math.max(0, (zJ + 22.6) * 0)}
          textAnchor="middle"
          fontFamily="Inter"
          fontWeight={800}
          fontSize={14}
          fill="#5a4022"
        >
          JERICÓ ▲
        </text>
        {/* herido */}
        <circle cx={160} cy={yH} r={14 * pulso} fill="rgba(200,40,30,.25)" />
        <circle cx={160} cy={yH} r={7} fill="#c8281e" stroke="white" strokeWidth={2} />
        {/* jugador */}
        <polygon points="150,135 162,165 150,158 138,165" fill="white" stroke="#222" strokeWidth={2} />
        <rect x={1.5} y={1.5} width={297} height={297} rx={17} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth={3} />
      </svg>
      <div style={{ paddingBottom: 8 }}>
        <div style={{ ...etiqueta, color: "white", fontSize: 26, letterSpacing: 2 }}>
          Camino a Jericó
        </div>
        <div style={{ ...etiqueta, color: "#efe6d2", fontWeight: 500, fontSize: 18, letterSpacing: 2, marginTop: 6 }}>
          31.85° N · 35.44° E
        </div>
        <div style={{ ...etiqueta, color: ORO, fontWeight: 500, fontSize: 18, letterSpacing: 2, marginTop: 4 }}>
          Lucas 10:25-37
        </div>
      </div>
    </div>
  );
};

// ---------- Subtítulo ----------
const Subtitulo: React.FC<{ f: number; inicio: number; fin: number; texto: string; cita: string }> = ({
  f,
  inicio,
  fin,
  texto,
  cita,
}) => {
  const o = aparece(f, inicio, fin);
  if (o === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 960,
        left: 90,
        right: 140,
        textAlign: "center",
        opacity: o,
        transform: `translateY(${(1 - o) * 14}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: 46,
          lineHeight: 1.2,
          color: "white",
          textShadow: "0 3px 10px rgba(0,0,0,.85), 0 0 2px black",
        }}
      >
        {texto}
      </div>
      <div style={{ ...etiqueta, color: ORO, fontSize: 22, marginTop: 12 }}>{cita}</div>
    </div>
  );
};

// ---------- Botón de interacción ----------
const BotonE: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f - (T.llegada + 5), fps, config: { damping: 12 } });
  const pulsado = f >= T.boton;
  const pop = pulsado ? spring({ frame: f - T.boton, fps, config: { damping: 8 } }) : 0;
  const o = interpolate(f, [T.llegada + 5, T.llegada + 10, T.boton + 12, T.boton + 20], [0, 1, 1, 0], clamp);
  if (o === 0) return null;
  const s = entra * (1 + (pulsado ? (1 - pop) * 0.25 : Math.sin(f * 0.3) * 0.04));
  return (
    <div
      style={{
        position: "absolute",
        top: 780,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 24px 12px 12px",
          background: "rgba(10,8,6,.75)",
          borderRadius: 12,
          transform: `scale(${s})`,
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 10,
            background: pulsado ? ORO : "white",
            color: "#111",
            fontFamily: "Inter",
            fontWeight: 800,
            fontSize: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          E
        </div>
        <div style={{ ...etiqueta, color: "white", fontSize: 30, letterSpacing: 3 }}>Ayudar</div>
      </div>
    </div>
  );
};

// ---------- Gancho inicial ----------
const Gancho: React.FC<{ f: number }> = ({ f }) => {
  const o = interpolate(f, [0, 6, 62, 74], [0, 1, 1, 0], clamp);
  if (o === 0) return null;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 520,
        background: "linear-gradient(180deg, rgba(0,0,0,.0) 20%, rgba(0,0,0,.45) 40%, rgba(0,0,0,0) 65%)",
      }}
    >
      <div style={{ ...etiqueta, color: "white", fontSize: 34, textAlign: "center", lineHeight: 1.35, padding: "0 90px" }}>
        ¿Y si existiera un juego con las misiones de Jesús?
      </div>
      <div
        style={{
          fontFamily: "Montserrat",
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1,
          color: "white",
          textAlign: "center",
          marginTop: 26,
          textTransform: "uppercase",
          textShadow: "0 6px 18px rgba(0,0,0,.6)",
          transform: `scale(${interpolate(f, [0, 74], [1.06, 1], clamp)})`,
        }}
      >
        El buen
        <br />
        samaritano
      </div>
      <div style={{ ...etiqueta, color: ORO, fontSize: 26, marginTop: 18 }}>Lucas 10:25-37</div>
    </AbsoluteFill>
  );
};

// ---------- Misión cumplida + recompensa ----------
const Final: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  if (f < T.cumplida) return null;
  const s = spring({ frame: f - T.cumplida, fps, config: { damping: 14 } });
  const oCumplida = interpolate(f, [T.cumplida, T.cumplida + 6, T.recompensa - 4, T.recompensa + 4], [0, 1, 1, 0], clamp);
  const r = spring({ frame: f - T.recompensa, fps, config: { damping: 15 } });
  const oRec = interpolate(f, [T.recompensa, T.recompensa + 8], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `rgba(10,8,6,${interpolate(f, [T.cumplida, T.cumplida + 15], [0, 0.45], clamp)})`,
      }}
    >
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: oCumplida }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            border: `6px solid ${ORO}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: ORO,
            fontSize: 70,
            transform: `scale(${s})`,
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontFamily: "Montserrat",
            fontWeight: 800,
            fontSize: 96,
            color: ORO,
            marginTop: 26,
            textTransform: "uppercase",
            letterSpacing: 2,
            transform: `scale(${0.8 + s * 0.2})`,
            textShadow: "0 6px 20px rgba(0,0,0,.6)",
          }}
        >
          Misión cumplida
        </div>
        <div style={{ ...etiqueta, color: "white", fontSize: 32, marginTop: 12 }}>El buen samaritano</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: oRec }}>
        <div style={{ ...etiqueta, color: "#efe6d2", fontSize: 26 }}>Recompensa desbloqueada</div>
        <div
          style={{
            marginTop: 22,
            padding: "26px 60px",
            border: `4px solid ${ORO}`,
            background: "rgba(10,8,6,.6)",
            transform: `scale(${r})`,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 92, color: ORO, textTransform: "uppercase" }}>
            Prójimo
          </div>
        </div>
        <div
          style={{
            fontFamily: "Inter",
            fontWeight: 800,
            fontSize: 44,
            color: "white",
            textAlign: "center",
            lineHeight: 1.25,
            marginTop: 36,
            padding: "0 110px",
            opacity: interpolate(f, [T.recompensa + 12, T.recompensa + 22], [0, 1], clamp),
          }}
        >
          Tu prójimo es el que tienes delante, no el que te cae bien.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {/* viñeta tipo cámara de juego */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.35) 100%)",
        }}
      />
      <div style={{ ...etiqueta, position: "absolute", top: 150, left: 60, color: "white", fontSize: 20, opacity: 0.85 }}>
        Misiones de Jesús
      </div>
      <Objetivo f={f} />
      <Minimapa f={f} />
      <Subtitulo
        f={f}
        inicio={95}
        fin={200}
        texto="«Un sacerdote lo vio… y pasó de largo.»"
        cita="Lucas 10:31"
      />
      <BotonE f={f} />
      <Subtitulo
        f={f}
        inicio={T.versiculo}
        fin={T.cumplida}
        texto="«Ve, y haz tú lo mismo.»"
        cita="Lucas 10:37"
      />
      <Gancho f={f} />
      <Final f={f} />
    </AbsoluteFill>
  );
};
