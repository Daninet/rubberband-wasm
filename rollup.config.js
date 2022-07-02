import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";
import commonjs from "@rollup/plugin-commonjs";
import packageJson from "./package.json";

const TERSER_CONFIG = {
  output: {
    comments: false,
  },
};

const LICENSE_CONFIG = {
  banner: {
    commentStyle: "ignored",
    content: `rubberband-wasm v${packageJson.version} (https://www.npmjs.com/package/rubberband-wasm)
    (c) Dani Biro
    @license GPLv2`,
  },
};

const getBundleConfig = (minified = false) => ({
  input: "src/index.ts",
  output: [
    {
      file: `dist/index.umd${minified ? ".min" : ""}.js`,
      name: "rubberband",
      format: "umd",
    },
    {
      file: `dist/index.esm${minified ? ".min" : ""}.js`,
      format: "es",
    },
  ],
  plugins: [nodeResolve(), commonjs(), json(), typescript(), ...(minified ? [terser(TERSER_CONFIG)] : []), license(LICENSE_CONFIG)],
});

export default [getBundleConfig(false), getBundleConfig(true)];
