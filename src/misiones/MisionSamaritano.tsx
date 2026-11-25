import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Escena3D } from "./Escena3D";
import { Hud } from "./Hud";

// Episodio de prueba: estilo videojuego low-poly 3D, 100% generado con código.
export const MisionSamaritano: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #8fb3d6 0%, #cfd8d6 38%, #f0d3a4 62%, #e9c48f 100%)",
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 52, near: 0.1, far: 400 }}
      >
        <Escena3D />
      </ThreeCanvas>
      <Hud />
    </AbsoluteFill>
  );
};
