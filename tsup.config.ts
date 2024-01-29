import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['lib/index.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
  sourcemap: true,
  minify: true,
  ignoreWatch: ['demo/**/*'],
});
