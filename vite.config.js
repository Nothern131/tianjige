import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        'ep1-fengshui': 'ep1-fengshui.html',
        'ep2-bazi': 'ep2-bazi.html',
        'ep3-liuyao': 'ep3-liuyao.html',
        architecture: 'architecture.html',
      },
    },
  },
  server: {
    port: 8889,
    open: false,
  },
  plugins: [
    {
      name: 'copy-static',
      closeBundle() {
        const src = path.resolve('static');
        const dst = path.resolve('dist/static');
        if (!fs.existsSync(src)) return;
        fs.cpSync(src, dst, { recursive: true });
      },
    },
  ],
});
