import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { T } from "./tiempos";

// =====================================================================
// Utilidades deterministas (mismo resultado en cada render)
// =====================================================================
const azar = (semilla: number) => {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
const ruido = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number, oct = 5) => {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * ruido(x * f, y * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return v;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = { ...clamp, easing: Easing.inOut(Easing.cubic) };

// Textura de ruido procedural (arena, tela, roca)
const texturaRuido = (
  semilla: number,
  base: string,
  variacion: number,
  escala: number,
  vetas = 0,
) => {
  const tam = 512;
  const canvas = document.createElement("canvas");
  canvas.width = tam;
  canvas.height = tam;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(tam, tam);
  const c = new THREE.Color(base);
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      // ruido periódico para que la textura se repita sin costuras
      const nx = Math.cos((x / tam) * Math.PI * 2) * escala + semilla;
      const ny = Math.sin((x / tam) * Math.PI * 2) * escala;
      const nz = Math.cos((y / tam) * Math.PI * 2) * escala;
      const nw = Math.sin((y / tam) * Math.PI * 2) * escala;
      let n = fbm(nx + nz * 1.7, ny + nw * 1.3, 5);
      n += (hash(x + semilla, y) - 0.5) * 0.25; // grano fino
      if (vetas) n += Math.sin((x / tam) * Math.PI * 2 * vetas + n * 4) * 0.12;
      const k = 1 + (n - 0.5) * variacion;
      const i = (y * tam + x) * 4;
      img.data[i] = Math.min(255, c.r * 255 * k);
      img.data[i + 1] = Math.min(255, c.g * 255 * k);
      img.data[i + 2] = Math.min(255, c.b * 255 * k);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// =====================================================================
// Mundo: camino curvo entre colinas
// =====================================================================
const caminoX = (z: number) => Math.sin(z * 0.035) * 2.2;

const altura = (x: number, z: number) => {
  const d = Math.abs(x - caminoX(z));
  const colinas = fbm(x * 0.03 + 10, z * 0.03, 5) * 14;
  const detalle = fbm(x * 0.2, z * 0.2, 3) * 0.6;
  const lejos = Math.max(0, d - 3.2);
  const mezcla = Math.min(1, lejos / 9);
  const valle = Math.pow(lejos, 1.3) * 0.16;
  const surcos =
    d < 2.2 ? -Math.exp(-Math.pow((d - 0.75) / 0.18, 2)) * 0.05 : 0;
  return (colinas - 4) * mezcla + valle + detalle * Math.min(1, d / 3) + surcos;
};

export const POS_HERIDO = new THREE.Vector3(caminoX(-24) + 1.6, 0, -24);
const Z_PARADA = -22.6;

const posJugador = (f: number) => {
  const z = interpolate(
    f,
    [0, T.llegada - 40, T.llegada],
    [0, Z_PARADA + 3, Z_PARADA],
    clamp,
  );
  const extra = interpolate(f, [T.llegada - 40, T.llegada], [0, 0.6], suave);
  return new THREE.Vector3(caminoX(z) + extra, 0, z);
};

// ---------- terreno ----------
const Terreno: React.FC = () => {
  const { geo, mapa } = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 260, 260);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -100);
    const p = g.attributes.position;
    const col: number[] = [];
    const arena = new THREE.Color("#c9a273");
    const arenaClara = new THREE.Color("#ddc199");
    const tierra = new THREE.Color("#9c7650");
    const roca = new THREE.Color("#8a7563");
    const camino = new THREE.Color("#e2cba4");
    const verde = new THREE.Color("#7f7a4a");
    const tmp = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const y = altura(x, z);
      p.setY(i, y);
      const d = Math.abs(x - caminoX(z));
      const n = fbm(x * 0.08, z * 0.08, 4);
      tmp.copy(arena).lerp(arenaClara, n);
      tmp.lerp(tierra, Math.max(0, fbm(x * 0.03 + 5, z * 0.03) - 0.45) * 1.4);
      if (y > 6) tmp.lerp(roca, Math.min(1, (y - 6) / 8) * 0.8);
      if (d > 2.5 && d < 12)
        tmp.lerp(verde, Math.max(0, fbm(x * 0.15, z * 0.15 + 9) - 0.55) * 1.3);
      const enCamino = 1 - THREE.MathUtils.smoothstep(d, 1.6, 2.6);
      tmp.lerp(camino, enCamino * 0.85);
      col.push(tmp.r, tmp.g, tmp.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = texturaRuido(3, "#ffffff", 0.35, 3);
    m.repeat.set(70, 70);
    return { geo: g, mapa: m };
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial
        vertexColors
        map={mapa}
        bumpMap={mapa}
        bumpScale={2.5}
        roughness={0.97}
      />
    </mesh>
  );
};

// ---------- roca orgánica ----------
const geoRoca = (semilla: number) => {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = fbm(v.x * 1.4 + semilla, v.y * 1.4 + v.z * 1.1, 4);
    v.multiplyScalar(0.75 + n * 0.55);
    v.y *= 0.65;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const Decorado: React.FC = () => {
  const datos = useMemo(() => {
    const r = azar(42);
    const geos = [geoRoca(1), geoRoca(7), geoRoca(13), geoRoca(21)];
    const texRoca = texturaRuido(11, "#ffffff", 0.5, 2);
    const rocas: {
      p: [number, number, number];
      s: number;
      rot: number;
      g: number;
    }[] = [];
    for (let i = 0; i < 170; i++) {
      const z = 10 - r() * 140;
      const lado = r() > 0.5 ? 1 : -1;
      const d = 2.7 + Math.pow(r(), 1.6) * 30;
      const x = caminoX(z) + lado * d;
      const s = 0.12 + Math.pow(r(), 2.5) * (d > 8 ? 2.6 : 0.8);
      rocas.push({
        p: [x, altura(x, z) - s * 0.15, z],
        s,
        rot: r() * 6,
        g: Math.floor(r() * 4),
      });
    }
    // Pasto seco instanciado
    const cantidad = 9000;
    const hoja = new THREE.ConeGeometry(0.012, 0.38, 3);
    hoja.translate(0, 0.19, 0);
    const pasto = new THREE.InstancedMesh(
      hoja,
      new THREE.MeshStandardMaterial({ roughness: 1 }),
      cantidad,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    let k = 0;
    while (k < cantidad) {
      const z = 12 - r() * 90;
      const x = caminoX(z) + (r() - 0.5) * 40;
      const d = Math.abs(x - caminoX(z));
      if (d < 2.0) continue;
      const densidad = fbm(x * 0.2, z * 0.2 + 3);
      if (densidad < 0.45) continue;
      const s = 0.5 + r() * 1.1;
      e.set((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(x, altura(x, z) - 0.02, z),
        q,
        new THREE.Vector3(s, s * (0.6 + r()), s),
      );
      pasto.setMatrixAt(k, m);
      col.setHSL(0.12 + r() * 0.04, 0.4 + r() * 0.2, 0.6 + r() * 0.15);
      pasto.setColorAt(k, col);
      k++;
    }
    pasto.castShadow = false;
    pasto.receiveShadow = true;

    // Arbustos
    const arbustos: { p: [number, number, number]; s: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const z = 8 - r() * 100;
      const lado = r() > 0.5 ? 1 : -1;
      const x = caminoX(z) + lado * (3 + r() * 18);
      arbustos.push({ p: [x, altura(x, z), z], s: 0.35 + r() * 0.7 });
    }
    return { geos, texRoca, rocas, pasto, arbustos };
  }, []);

  return (
    <>
      {datos.rocas.map((c, i) => (
        <mesh
          key={`r${i}`}
          geometry={datos.geos[c.g]}
          position={c.p}
          rotation={[0, c.rot, 0]}
          scale={c.s}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#b19a80"
            map={datos.texRoca}
            bumpMap={datos.texRoca}
            bumpScale={4}
            roughness={0.95}
          />
        </mesh>
      ))}
      <primitive object={datos.pasto} />
      {datos.arbustos.map((a, i) => (
        <group key={`a${i}`} position={a.p} scale={a.s}>
          {[0, 1, 2, 3].map((j) => (
            <mesh
              key={j}
              geometry={datos.geos[j]}
              position={[Math.sin(j * 2.1) * 0.5, 0.35 + j * 0.08, Math.cos(j * 2.1) * 0.5]}
              scale={0.55}
              castShadow
            >
              <meshStandardMaterial color="#8c8f5a" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
      {[
        [-5, -9],
        [5, -15],
        [-5.5, -31],
        [4.6, -36],
        [-4.2, 4],
        [6.5, -48],
        [-7, -55],
      ].map(([dx, z], i) => (
        <Olivo key={`o${i}`} x={caminoX(z) + dx} z={z} semilla={i} />
      ))}
    </>
  );
};

const Olivo: React.FC<{ x: number; z: number; semilla: number }> = ({
  x,
  z,
  semilla,
}) => {
  const { tronco, copas } = useMemo(() => {
    const r = azar(100 + semilla);
    const curva = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.25, 0.8, 0.1),
      new THREE.Vector3(-0.1, 1.6, -0.15),
      new THREE.Vector3(0.2, 2.2, 0.1),
    ]);
    const t = new THREE.TubeGeometry(curva, 20, 0.16, 8, false);
    const c = Array.from({ length: 7 }, () => ({
      p: [(r() - 0.5) * 2.2, 2.3 + r() * 1.0, (r() - 0.5) * 2.2] as [
        number,
        number,
        number,
      ],
      s: 0.6 + r() * 0.5,
      g: geoRoca(semilla * 3 + Math.floor(r() * 50)),
    }));
    return { tronco: t, copas: c };
  }, [semilla]);
  return (
    <group position={[x, altura(x, z), z]}>
      <mesh geometry={tronco} castShadow>
        <meshStandardMaterial color="#5a4632" roughness={1} />
      </mesh>
      {copas.map((c, i) => (
        <mesh key={i} geometry={c.g} position={c.p} scale={[c.s, c.s * 1.2, c.s]} castShadow>
          <meshStandardMaterial color="#7e8a62" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- polvo en el aire ----------
const Polvo: React.FC<{ frame: number; centro: THREE.Vector3 }> = ({
  frame,
  centro,
}) => {
  const base = useMemo(() => {
    const r = azar(5);
    return Array.from({ length: 700 }, () => [
      (r() - 0.5) * 24,
      r() * 6,
      (r() - 0.5) * 30,
      r() * 6,
    ]);
  }, []);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = new Float32Array(base.length * 3);
  base.forEach(([x, y, z, ph], i) => {
    pos[i * 3] = centro.x + x + Math.sin(frame * 0.02 + ph) * 0.6 + frame * 0.01;
    pos[i * 3 + 1] = y + Math.sin(frame * 0.03 + ph * 2) * 0.3;
    pos[i * 3 + 2] = centro.z + z;
  });
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.012}
        color="#fff0d0"
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
};

// =====================================================================
// Personajes: ropa con pliegues, manto, pelo, barba
// =====================================================================
const geoTunica = (semilla: number) => {
  const perfil = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.4, 0.02),
    new THREE.Vector2(0.37, 0.25),
    new THREE.Vector2(0.31, 0.7),
    new THREE.Vector2(0.25, 1.05),
    new THREE.Vector2(0.24, 1.3),
    new THREE.Vector2(0.27, 1.5),
    new THREE.Vector2(0.24, 1.62),
    new THREE.Vector2(0.09, 1.72),
    new THREE.Vector2(0.0, 1.74),
  ];
  const g = new THREE.LatheGeometry(perfil, 48);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const ang = Math.atan2(v.z, v.x);
    const caida = Math.max(0, 1.2 - v.y) / 1.2; // pliegues más marcados abajo
    const pliegue =
      Math.sin(ang * 9 + semilla) * 0.022 * caida +
      Math.sin(ang * 17 + v.y * 3) * 0.008;
    const r = Math.hypot(v.x, v.z);
    if (r > 0.01) {
      const k = (r + pliegue) / r;
      v.x *= k;
      v.z *= k;
    }
    v.z *= 0.82; // cuerpo más plano de frente a espalda
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const geoManto = () => {
  // Manto: tela abierta que cae desde el hombro izquierdo cruzando la espalda
  const perfil = [
    new THREE.Vector2(0.27, 1.6),
    new THREE.Vector2(0.33, 1.4),
    new THREE.Vector2(0.37, 1.0),
    new THREE.Vector2(0.42, 0.55),
    new THREE.Vector2(0.45, 0.3),
  ];
  const g = new THREE.LatheGeometry(perfil, 40, -0.4, Math.PI * 1.25);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const ang = Math.atan2(v.z, v.x);
    const r = Math.hypot(v.x, v.z);
    const k = (r + Math.sin(ang * 7) * 0.02 * (1.6 - v.y)) / r;
    v.x *= k;
    v.z *= k * 0.85;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

const geoPelo = (largo: number) => {
  const g = new THREE.SphereGeometry(0.172, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    v.multiplyScalar(1 + Math.sin(Math.atan2(v.z, v.x) * 22) * 0.02);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const atras = new THREE.CylinderGeometry(0.16, 0.19, largo, 24, 1, true, Math.PI * 0.1, Math.PI * 0.8);
  return { g, atras };
};

type PersonaProps = {
  tunica: string;
  manto: string;
  pelo?: string;
  barba?: boolean;
  tocado?: string;
  fase?: number;
  andando?: number;
  agachado?: number;
  brazosAdelante?: number;
  venda?: number;
  semilla?: number;
};

const Persona: React.FC<PersonaProps> = ({
  tunica,
  manto,
  pelo = "#2f2118",
  barba = true,
  tocado,
  fase = 0,
  andando = 0,
  agachado = 0,
  brazosAdelante = 0,
  venda = 0,
  semilla = 0,
}) => {
  const recursos = useMemo(() => {
    const tela = texturaRuido(semilla + 31, "#ffffff", 0.18, 6, 40);
    tela.repeat.set(3, 3);
    return {
      tunica: geoTunica(semilla),
      manto: geoManto(),
      pelo: geoPelo(0.32),
      tela,
    };
  }, [semilla]);
  const piel = "#b9845f";
  const swing = Math.sin(fase) * 0.5 * andando;
  const bob = Math.abs(Math.cos(fase)) * 0.035 * andando;
  const baja = agachado * 0.32;
  const balanceo = Math.sin(fase) * 0.04 * andando;

  const matTela = (color: string) => (
    <meshStandardMaterial
      color={color}
      map={recursos.tela}
      bumpMap={recursos.tela}
      bumpScale={1.5}
      roughness={0.92}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group position={[0, bob - baja, 0]} rotation={[agachado * 0.5, balanceo, 0]}>
      {/* sandalias */}
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * 0.1, 0.03, l * swing * 0.3]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.25]} />
          <meshStandardMaterial color="#4a3423" roughness={0.8} />
        </mesh>
      ))}
      <mesh geometry={recursos.tunica} castShadow receiveShadow rotation={[swing * 0.06, 0, 0]}>
        {matTela(tunica)}
      </mesh>
      {/* cinturón */}
      <mesh position={[0, 1.08, 0]} scale={[1, 1, 0.82]}>
        <torusGeometry args={[0.255, 0.025, 8, 32]} />
        <meshStandardMaterial color="#6b4c2f" roughness={0.9} />
      </mesh>
      <mesh
        geometry={recursos.manto}
        castShadow
        rotation={[0.08 + swing * 0.04, 0.4, 0.06]}
        scale={[1.02, 1, 1.02]}
      >
        {matTela(manto)}
      </mesh>
      {/* brazos con mangas anchas */}
      {[-1, 1].map((lado) => (
        <group
          key={lado}
          position={[lado * 0.28, 1.55, 0]}
          rotation={[-lado * swing * 0.9 - brazosAdelante * 1.15, 0, lado * 0.1]}
        >
          <mesh position={[0, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.12, 0.58, 16, 1, true]} />
            {matTela(tunica)}
          </mesh>
          <mesh position={[0, -0.56, 0.01]} castShadow>
            <capsuleGeometry args={[0.035, 0.08, 4, 10]} />
            <meshStandardMaterial color={piel} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* cabeza */}
      <group position={[0, 1.88, 0]}>
        <mesh castShadow scale={[0.92, 1.08, 0.98]}>
          <sphereGeometry args={[0.155, 32, 24]} />
          <meshStandardMaterial color={piel} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.01, -0.152]} rotation={[-0.3, 0, 0]}>
          <coneGeometry args={[0.025, 0.06, 8]} />
          <meshStandardMaterial color={piel} roughness={0.55} />
        </mesh>
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.05, 0.03, -0.138]}>
            <sphereGeometry args={[0.015, 10, 8]} />
            <meshStandardMaterial color="#1b130e" roughness={0.3} />
          </mesh>
        ))}
        <mesh geometry={recursos.pelo.g} position={[0, 0.01, 0.005]} castShadow>
          <meshStandardMaterial color={pelo} roughness={0.75} />
        </mesh>
        <mesh geometry={recursos.pelo.atras} position={[0, -0.13, 0.02]} castShadow>
          <meshStandardMaterial color={pelo} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
        {barba && (
          <mesh position={[0, -0.1, -0.08]} scale={[1, 1.2, 0.9]} castShadow>
            <sphereGeometry args={[0.105, 20, 16, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6]} />
            <meshStandardMaterial color={pelo} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
        {tocado && (
          <mesh position={[0, 0.11, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.17, 0.16, 24]} />
            {matTela(tocado)}
          </mesh>
        )}
        {venda > 0 && (
          <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2 + 0.25, 0, 0]} scale={venda}>
            <torusGeometry args={[0.163, 0.03, 10, 32]} />
            <meshStandardMaterial color="#efe8da" roughness={0.9} />
          </mesh>
        )}
      </group>
    </group>
  );
};

// =====================================================================
// Cámara, cielo y efectos
// =====================================================================
const Camara: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const j = posJugador(frame);
    const zAdelante = j.z - 8;
    const seguir = new THREE.Vector3(j.x + 1.0, 2.6, j.z + 5.4);
    const mirarSeguir = new THREE.Vector3(caminoX(zAdelante) - 0.2, 1.3, zAdelante);
    const lateral = new THREE.Vector3(j.x - 3.8, 1.45, j.z - 8.4);
    const mirarLateral = new THREE.Vector3(
      (j.x + POS_HERIDO.x) / 2,
      1.0,
      (j.z + POS_HERIDO.z) / 2,
    );
    const k = interpolate(frame, [T.boton - 10, T.boton + 25], [0, 1], suave);
    const fin = interpolate(frame, [T.cumplida, T.total], [0, 0.55], clamp);
    const pos = seguir.clone().lerp(lateral, k);
    if (fin > 0) {
      const off = pos.clone().sub(mirarLateral);
      off.applyAxisAngle(new THREE.Vector3(0, 1, 0), -fin);
      off.multiplyScalar(1 + fin * 0.6);
      off.y += fin * 1.5;
      pos.copy(mirarLateral).add(off);
    }
    // leve movimiento de cámara en mano
    pos.x += Math.sin(frame * 0.05) * 0.04;
    pos.y += Math.sin(frame * 0.07 + 1) * 0.03;
    camera.position.copy(pos);
    camera.lookAt(mirarSeguir.clone().lerp(mirarLateral, k));
    camera.updateMatrixWorld();
  }, [frame, camera]);
  return null;
};

const SOL = new THREE.Vector3().setFromSphericalCoords(
  1,
  THREE.MathUtils.degToRad(90 - 20),
  THREE.MathUtils.degToRad(-35),
);

const Cielo: React.FC = () => {
  const cielo = useMemo(() => {
    const s = new Sky();
    s.scale.setScalar(380);
    const u = s.material.uniforms;
    u.turbidity.value = 7;
    u.rayleigh.value = 1.6;
    u.mieCoefficient.value = 0.006;
    u.mieDirectionalG.value = 0.86;
    u.sunPosition.value.copy(SOL);
    return s;
  }, []);
  return <primitive object={cielo} />;
};

// =====================================================================
// Escena
// =====================================================================
export const Escena3D: React.FC = () => {
  const frame = useCurrentFrame();
  const j = posJugador(frame);
  const velocidad = interpolate(frame, [0, T.llegada - 30, T.llegada], [1, 1, 0], clamp);
  const fase = frame * 0.3;

  const zSacerdote = interpolate(frame, [0, T.llegada], [-45, -1], clamp);
  const levanta = interpolate(frame, [T.boton + 25, T.boton + 70], [0, 1], suave);
  const agacha = interpolate(frame, [T.boton, T.boton + 22], [0, 1], suave);
  const venda = interpolate(frame, [T.boton + 40, T.boton + 52], [0, 1], suave);
  const giroJugador = interpolate(frame, [T.llegada - 40, T.llegada], [0, -0.75], suave);
  const solPos = SOL.clone().multiplyScalar(80).add(new THREE.Vector3(j.x, 0, j.z));

  return (
    <>
      <Camara frame={frame} />
      <Cielo />
      <fogExp2 attach="fog" args={["#dcd3c0", 0.009]} />
      <hemisphereLight args={["#d6e4f5", "#b08a5e", 1.1]} />
      <directionalLight
        position={solPos}
        target-position={[j.x, 0, j.z]}
        intensity={3.4}
        color="#ffd7a3"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <Terreno />
      <Decorado />
      <Polvo frame={frame} centro={j} />

      <group position={j} rotation={[0, giroJugador, 0]}>
        <Persona
          tunica="#e9e1cf"
          manto="#8e2f22"
          fase={fase}
          andando={velocidad}
          agachado={agacha}
          brazosAdelante={agacha}
          semilla={1}
        />
      </group>

      <group
        position={[caminoX(zSacerdote) - 1.4, 0, zSacerdote]}
        rotation={[0, Math.PI + 0.1, 0]}
      >
        <Persona
          tunica="#3a3866"
          manto="#b89443"
          tocado="#ece5d6"
          pelo="#1f1712"
          fase={fase + 1.3}
          andando={1}
          semilla={2}
        />
      </group>

      <group
        position={[POS_HERIDO.x, 0.08, POS_HERIDO.z]}
        rotation={[0, -0.4, interpolate(levanta, [0, 1], [-1.45, -0.7])]}
      >
        <Persona tunica="#c7b89c" manto="#6e5d48" pelo="#1d140e" venda={venda} semilla={3} />
      </group>

      {null}
    </>
  );
};
