import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { interpolate, Easing, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { T } from "./tiempos";

// ---------- utilidades deterministas ----------
const azar = (semilla: number) => {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = { ...clamp, easing: Easing.inOut(Easing.cubic) };

// Altura del terreno: camino plano en |x|<2.4, colinas a los lados.
const altura = (x: number, z: number) => {
  const ondas =
    Math.sin(x * 0.18 + z * 0.07) * 1.2 +
    Math.sin(x * 0.41 - z * 0.23) * 0.5 +
    Math.cos(z * 0.13 + x * 0.05) * 0.8;
  const lejos = Math.max(0, Math.abs(x) - 3);
  const subida = Math.pow(lejos, 1.35) * 0.18;
  const mezcla = Math.min(1, lejos / 5);
  return (ondas * 0.6 + 0.6) * mezcla + subida;
};

// ---------- posiciones de la historia ----------
export const POS_HERIDO = new THREE.Vector3(1.5, 0, -24);
const Z_PARADA = -22.6;

const posJugador = (f: number) => {
  const z = interpolate(f, [0, T.llegada - 40, T.llegada], [0, Z_PARADA + 3, Z_PARADA], clamp);
  const x = interpolate(f, [T.llegada - 40, T.llegada], [0, 0.55], suave);
  return new THREE.Vector3(x, 0, z);
};

// ---------- terreno ----------
const Terreno: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(160, 220, 90, 120).toNonIndexed();
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -60);
    const p = g.attributes.position;
    const colores: number[] = [];
    const r = azar(7);
    const arena = new THREE.Color("#d8b47e");
    const arenaOscura = new THREE.Color("#b98f5c");
    const camino = new THREE.Color("#e6cfa3");
    const roca = new THREE.Color("#9c7a55");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, altura(x, z));
    }
    // color por triángulo (look low-poly)
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
      let c: THREE.Color;
      if (Math.abs(cx) < 2.1) c = camino.clone();
      else if (cy > 6) c = roca.clone();
      else c = arena.clone().lerp(arenaOscura, r() * 0.6);
      c.offsetHSL(0, 0, (r() - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) colores.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colores, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={1} />
    </mesh>
  );
};

// ---------- rocas, arbustos, montañas ----------
const Decorado: React.FC = () => {
  const cosas = useMemo(() => {
    const r = azar(42);
    const rocas: { p: [number, number, number]; s: number; rot: number }[] = [];
    const arbustos: { p: [number, number, number]; s: number }[] = [];
    for (let i = 0; i < 140; i++) {
      const lado = r() > 0.5 ? 1 : -1;
      const x = lado * (2.6 + r() * 26);
      const z = 8 - r() * 120;
      const s = 0.2 + r() * (Math.abs(x) > 10 ? 1.6 : 0.6);
      if (i % 3 === 0) arbustos.push({ p: [x, altura(x, z), z], s: s * 0.7 });
      else rocas.push({ p: [x, altura(x, z), z], s, rot: r() * 6 });
    }
    return { rocas, arbustos };
  }, []);
  return (
    <>
      {cosas.rocas.map((c, i) => (
        <mesh
          key={`r${i}`}
          position={c.p}
          rotation={[c.rot, c.rot * 2, 0]}
          scale={[c.s, c.s * 0.7, c.s]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#a88a68" flatShading roughness={1} />
        </mesh>
      ))}
      {cosas.arbustos.map((c, i) => (
        <mesh key={`a${i}`} position={c.p} scale={c.s} castShadow>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#7d8a4a" flatShading roughness={1} />
        </mesh>
      ))}
      {/* montañas lejanas */}
      {[
        [-45, -140, 28],
        [-10, -165, 34],
        [30, -150, 30],
        [60, -120, 24],
        [-70, -100, 22],
      ].map(([x, z, h], i) => (
        <mesh key={`m${i}`} position={[x, h / 2 - 2, z]}>
          <coneGeometry args={[h * 1.3, h, 6]} />
          <meshStandardMaterial color="#b88c6c" flatShading roughness={1} />
        </mesh>
      ))}
      {/* olivos junto al camino */}
      {[
        [-4, -10],
        [4.5, -16],
        [-5, -30],
        [3.8, -34],
        [-3.6, 4],
      ].map(([x, z], i) => (
        <group key={`o${i}`} position={[x, altura(x, z), z]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.2, 1.6, 6]} />
            <meshStandardMaterial color="#6b4f33" flatShading />
          </mesh>
          <mesh position={[0, 2, 0]} castShadow>
            <icosahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color="#8a9556" flatShading />
          </mesh>
          <mesh position={[0.6, 1.7, 0.3]} castShadow>
            <icosahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#7a8649" flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
};

// ---------- personaje low-poly ----------
type PersonaProps = {
  tunica: string;
  manto: string;
  pelo?: string;
  barba?: boolean;
  tocado?: string;
  fase?: number; // ciclo de caminata (radianes)
  andando?: number; // 0..1 intensidad de caminata
  agachado?: number; // 0..1
  brazosAdelante?: number; // 0..1
  venda?: number; // 0..1
};

const Persona: React.FC<PersonaProps> = ({
  tunica,
  manto,
  pelo = "#3b2a1e",
  barba = true,
  tocado,
  fase = 0,
  andando = 0,
  agachado = 0,
  brazosAdelante = 0,
  venda = 0,
}) => {
  const piel = "#c48f66";
  const swing = Math.sin(fase) * 0.55 * andando;
  const bob = Math.abs(Math.sin(fase)) * 0.05 * andando;
  const baja = agachado * 0.5;
  return (
    <group position={[0, bob - baja, 0]}>
      {/* pies */}
      <mesh position={[-0.1, 0.05, swing * 0.35]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.24]} />
        <meshStandardMaterial color="#5a3d26" flatShading />
      </mesh>
      <mesh position={[0.1, 0.05, -swing * 0.35]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.24]} />
        <meshStandardMaterial color="#5a3d26" flatShading />
      </mesh>
      {/* túnica */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.38, 1.3, 9]} />
        <meshStandardMaterial color={tunica} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 9]} />
        <meshStandardMaterial color={tunica} flatShading roughness={0.95} />
      </mesh>
      {/* manto cruzado */}
      <mesh position={[0.02, 1.15, 0.0]} rotation={[0, 0, 0.55]} castShadow>
        <cylinderGeometry args={[0.31, 0.36, 1.05, 9, 1, true]} />
        <meshStandardMaterial
          color={manto}
          flatShading
          side={THREE.DoubleSide}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0.18, 0.6, 0.05]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[0.32, 0.9, 0.5]} />
        <meshStandardMaterial color={manto} flatShading roughness={0.9} />
      </mesh>
      {/* brazos */}
      {[-1, 1].map((lado) => (
        <group
          key={lado}
          position={[lado * 0.3, 1.62, 0]}
          rotation={[
            lado * swing - brazosAdelante * 1.1,
            0,
            lado * 0.12,
          ]}
        >
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.62, 6]} />
            <meshStandardMaterial color={tunica} flatShading />
          </mesh>
          <mesh position={[0, -0.64, 0]} castShadow>
            <icosahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={piel} flatShading />
          </mesh>
        </group>
      ))}
      {/* cuello y cabeza */}
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.12, 6]} />
        <meshStandardMaterial color={piel} flatShading />
      </mesh>
      <mesh position={[0, 1.92, 0]} castShadow>
        <icosahedronGeometry args={[0.16, 1]} />
        <meshStandardMaterial color={piel} flatShading />
      </mesh>
      {/* pelo largo */}
      <mesh position={[0, 1.97, 0.03]} scale={[1.08, 1, 1.08]} castShadow>
        <icosahedronGeometry args={[0.165, 1]} />
        <meshStandardMaterial color={pelo} flatShading />
      </mesh>
      <mesh position={[0, 1.78, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.32, 0.12]} />
        <meshStandardMaterial color={pelo} flatShading />
      </mesh>
      {barba && (
        <mesh position={[0, 1.8, -0.1]} rotation={[Math.PI + 0.3, 0, 0]}>
          <coneGeometry args={[0.11, 0.2, 6]} />
          <meshStandardMaterial color={pelo} flatShading />
        </mesh>
      )}
      {tocado && (
        <mesh position={[0, 2.1, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 0.18, 8]} />
          <meshStandardMaterial color={tocado} flatShading />
        </mesh>
      )}
      {venda > 0 && (
        <mesh
          position={[0, 1.97, 0]}
          rotation={[Math.PI / 2 + 0.2, 0, 0]}
          scale={venda}
        >
          <torusGeometry args={[0.17, 0.035, 6, 12]} />
          <meshStandardMaterial color="#f4efe4" flatShading />
        </mesh>
      )}
    </group>
  );
};

// ---------- cámara ----------
const Camara: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const j = posJugador(frame);
    // Cámara de seguimiento (tercera persona, por encima del hombro)
    const seguir = new THREE.Vector3(j.x + 1.1, 3.0, j.z + 6.2);
    const mirarSeguir = new THREE.Vector3(j.x - 0.2, 1.3, j.z - 8);
    // Plano lateral para la ayuda
    const lateral = new THREE.Vector3(j.x - 2.6, 2.0, j.z - 6.5);
    const mirarLateral = new THREE.Vector3(
      (j.x + POS_HERIDO.x) / 2,
      0.8,
      (j.z + POS_HERIDO.z) / 2,
    );
    const k = interpolate(frame, [T.boton - 10, T.boton + 25], [0, 1], suave);
    // Órbita lenta al final
    const fin = interpolate(frame, [T.cumplida, T.total], [0, 0.6], clamp);
    const pos = seguir.clone().lerp(lateral, k);
    if (fin > 0) {
      const centro = mirarLateral;
      const off = pos.clone().sub(centro);
      off.applyAxisAngle(new THREE.Vector3(0, 1, 0), -fin);
      off.multiplyScalar(1 + fin * 0.5);
      off.y += fin * 1.2;
      pos.copy(centro).add(off);
    }
    camera.position.copy(pos);
    camera.lookAt(mirarSeguir.clone().lerp(mirarLateral, k));
    camera.updateMatrixWorld();
  }, [frame, camera]);
  return null;
};

// ---------- escena ----------
export const Escena3D: React.FC = () => {
  const frame = useCurrentFrame();
  const j = posJugador(frame);
  const velocidad = interpolate(
    frame,
    [0, T.llegada - 30, T.llegada],
    [1, 1, 0],
    clamp,
  );
  const fase = frame * 0.32;

  // Sacerdote: viene de frente por el otro lado y pasa de largo
  const zSacerdote = interpolate(frame, [0, T.llegada], [-45, -1], clamp);
  // Herido: de tumbado a sentado
  const levanta = interpolate(frame, [T.boton + 25, T.boton + 70], [0, 1], suave);
  const agacha = interpolate(frame, [T.boton, T.boton + 22], [0, 1], suave);
  const venda = interpolate(frame, [T.boton + 40, T.boton + 52], [0, 1], suave);
  const giroJugador = interpolate(
    frame,
    [T.llegada - 40, T.llegada],
    [0, -0.75],
    suave,
  );

  return (
    <>
      <Camara frame={frame} />
      <fog attach="fog" args={["#efd3a8", 25, 150]} />
      <hemisphereLight args={["#fff1d6", "#a07a52", 0.9]} />
      <directionalLight
        position={[-30, 22, -40]}
        intensity={2.6}
        color="#ffd29a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0006}
      />
      <Terreno />
      <Decorado />

      {/* Jugador */}
      <group position={j} rotation={[0, giroJugador, 0]}>
        <Persona
          tunica="#ece3d0"
          manto="#9b3a2a"
          fase={fase}
          andando={velocidad}
          agachado={agacha}
          brazosAdelante={agacha}
        />
      </group>

      {/* Sacerdote */}
      <group position={[-1.6, 0, zSacerdote]} rotation={[0, Math.PI + 0.12, 0]}>
        <Persona
          tunica="#3e3a6e"
          manto="#c9a24a"
          tocado="#efe9dc"
          pelo="#2a1f18"
          fase={fase + 1.3}
          andando={1}
        />
      </group>

      {/* Herido */}
      <group
        position={[POS_HERIDO.x, 0.05, POS_HERIDO.z]}
        rotation={[0, -0.4, interpolate(levanta, [0, 1], [-1.45, -0.7])]}
      >
        <Persona
          tunica="#cdbfa6"
          manto="#7c6a52"
          pelo="#22180f"
          venda={venda}
        />
      </group>
    </>
  );
};
