import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Escena3D } from "./Escena3D";
import { Hud } from "./Hud";

// Grano de película: ruido SVG que cambia en cada frame
const Grano: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.14, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="grano">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={frame % 50}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grano)" />
      </svg>
    </AbsoluteFill>
  );
};

// Episodio de prueba: estilo maqueta cinematográfica 3D, 100% generado con código.
export const MisionSamaritano: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#d9cdb5" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows="soft"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ fov: 50, near: 0.1, far: 400 }}
        style={{ filter: "contrast(1.08) saturate(1.1) sepia(0.06)" }}
      >
        <Escena3D />
      </ThreeCanvas>
      <Grano />
      <Hud />
    </AbsoluteFill>
  );
};
