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
        'ep7-zhuge': 'ep7-zhuge.html',
        'ep8-ziwei': 'ep8-ziwei.html',
        architecture: 'architecture.html',
      },
      // 静默非模块 script 的 bundle 警告（这些文件由 copy-static 单独复制）
      onwarn(warning, defaultHandler) {
        if (
          warning.code === 'MIXED_EXPORTS' ||
          (warning.message && warning.message.includes("can't be bundled"))
        ) {
          return;
        }
        defaultHandler(warning);
      },
    },
    cssCodeSplit: false,
    copyPublicDir: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 8889,
    open: false,
  },
  plugins: [
    {
      name: 'copy-static',
      writeBundle() {
        const src = path.resolve('static');
        const dst = path.resolve('dist/static');
        if (!fs.existsSync(src)) return;
        fs.rmSync(dst, { recursive: true, force: true });
        fs.cpSync(src, dst, { recursive: true });
      },
    },
  ],
});
