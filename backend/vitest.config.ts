import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    timeout: 30000,
    hookTimeout: 30000,
    watch: false,
    reporters: ['default'],
    sequence: {
      concurrent: false
    }
  }
});
