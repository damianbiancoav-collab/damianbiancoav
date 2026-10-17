// Genera subtítulos automáticos (en español) a partir del audio de un vídeo.
//
// Uso:   npm run subtitular -- public/videos/mi-video.mp4
// Crea:  public/subtitulos/mi-video.json
//
// La primera vez descarga Whisper y el modelo de voz (~500 MB), tarda unos minutos.

import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// "small" es un buen equilibrio entre calidad y velocidad.
// Para más precisión usa "medium" (más lento, ~1,5 GB).
const MODELO = "small";
const VERSION_WHISPER = "1.5.5";

const video = process.argv[2];
if (!video || !fs.existsSync(video)) {
  console.error("Indica la ruta del vídeo, por ejemplo:");
  console.error("  npm run subtitular -- public/videos/mi-video.mp4");
  process.exit(1);
}

const carpetaWhisper = path.join(process.cwd(), "whisper.cpp");
const nombre = path.parse(video).name;
const audio = path.join(carpetaWhisper, `${nombre}.wav`);
const salida = path.join(process.cwd(), "public", "subtitulos", `${nombre}.json`);

await installWhisperCpp({ to: carpetaWhisper, version: VERSION_WHISPER });
await downloadWhisperModel({ model: MODELO, folder: carpetaWhisper });

console.log("Extrayendo audio...");
execSync(
  `npx remotion ffmpeg -i "${video}" -ar 16000 -ac 1 "${audio}" -y`,
  { stdio: "ignore" },
);

console.log("Transcribiendo (puede tardar un poco)...");
const resultado = await transcribe({
  model: MODELO,
  whisperPath: carpetaWhisper,
  whisperCppVersion: VERSION_WHISPER,
  inputPath: audio,
  language: "Spanish",
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput: resultado });
fs.mkdirSync(path.dirname(salida), { recursive: true });
fs.writeFileSync(salida, JSON.stringify(captions, null, 2));
fs.rmSync(audio);

console.log(`Listo: ${path.relative(process.cwd(), salida)}`);
console.log(
  `En Remotion Studio, pon en "subtitulos": subtitulos/${nombre}.json`,
);
