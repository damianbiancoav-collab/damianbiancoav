// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// Entorno cloud: usar el Chromium preinstalado (el dominio de descarga de Remotion está bloqueado).
// En tu ordenador puedes borrar estas líneas; Remotion descargará su propio Chrome.
const localChrome = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (require("fs").existsSync(localChrome)) {
  Config.setBrowserExecutable(localChrome);
}
