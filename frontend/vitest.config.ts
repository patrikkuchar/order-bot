import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['test/unit/**/*.spec.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    coverage: {
      reporter: ['text', 'html']
    },
    typecheck: {
      tsconfig: './tsconfig.vitest.json'
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src')
    }
  },
  esbuild: {
    target: 'es2022'
  }
});
