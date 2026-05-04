import { build } from "esbuild";

await build({
  entryPoints: ["src/server.ts"],
  outfile: "dist/server.js",
  bundle: true,
  platform: "node",
  target: "node23",
  format: "esm",
  sourcemap: true,
  packages: "external",
});

console.log("⚡ Build completed successfully");
