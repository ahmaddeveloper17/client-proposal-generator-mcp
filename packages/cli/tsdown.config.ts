import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: "esm",
  target: "node22",
  dts: true,
  clean: true,
  outDir: "./dist",
  minify: false,
  sourcemap: true,
  deps: {
    neverBundle: ["@dev_ahmad_org/proposal-generator"],
  },
});
