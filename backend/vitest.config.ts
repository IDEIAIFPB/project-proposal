import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    include: ['supertest'],
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
