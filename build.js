import { build } from "esbuild";

// Local / traditional server build
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

// Vercel serverless build – fully bundled, no directory-import issues
await build({
  entryPoints: ["src/vercel-entry.ts"],
  outfile: "dist/vercel.js",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",   // CJS avoids Node ESM directory-import restriction
  sourcemap: true,
  // No "packages: external" – bundle everything so Vercel gets one clean file
});

console.log("⚡ Build completed successfully");
