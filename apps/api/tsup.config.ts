import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  clean: true,
  // Bundle the workspace package so the deployed artifact doesn't depend on its build output.
  noExternal: ['@biophonics/shared'],
});
