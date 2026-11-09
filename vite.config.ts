/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext'
  },
  test: {
    include: ['src/**/*.{test,spec}.ts', 'shared/**/*.{test,spec}.ts']
  }
});
