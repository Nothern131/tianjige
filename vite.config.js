import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        index: 'index.html',
        'ep1-fengshui': 'ep1-fengshui.html',
        'ep2-bazi': 'ep2-bazi.html',
        'ep3-liuyao': 'ep3-liuyao.html',
        'ep4-meihua': 'ep4-meihua.html',
        'ep5-qimen': 'ep5-qimen.html',
        'ep6-taiyi': 'ep6-taiyi.html',
        architecture: 'architecture.html',
      },
    },
    cssCodeSplit: false,
    copyPublicDir: false,
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
