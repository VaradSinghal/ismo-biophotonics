import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true, // Run sequentially for DB tests
      },
    },
  },
});
