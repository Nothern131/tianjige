import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        'ep1-fengshui': 'ep1-fengshui.html',
        'ep2-bazi': 'ep2-bazi.html',
        architecture: 'architecture.html',
      },
    },
  },
  server: {
    port: 8889,
    open: false,
  },
});
