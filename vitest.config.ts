import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    alias: {
      'server-only': path.resolve(__dirname, './tests/mocks/server-only.js'),
      '@': path.resolve(__dirname, './'),
    },
  },
  resolve: {
    alias: {
      'server-only': path.resolve(__dirname, './tests/mocks/server-only.js'),
      '@': path.resolve(__dirname, './'),
    },
  },
});
