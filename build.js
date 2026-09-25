// 直接构建脚本：复制 static/ 和所有 HTML 入口到 dist/，绕过 Vite 堆损坏 bug
const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');

// 清理旧 dist
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

// 1. 复制 static/ → dist/static/
const staticSrc = path.join(root, 'static');
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, path.join(dist, 'static'), { recursive: true });
  console.log('✓ dist/static 已复制');
}

// 2. 复制所有 HTML 入口 → dist/
const htmlFiles = ['index.html', 'ep1-fengshui.html', 'ep2-bazi.html', 'ep3-liuyao.html', 'ep4-meihua.html', 'ep5-qimen.html', 'ep6-taiyi.html', 'ep7-zhuge.html', 'ep8-ziwei.html', 'architecture.html'];
htmlFiles.forEach((f) => {
  const src = path.join(root, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, f));
  }
});
console.log('✓ HTML 入口已复制');

// 3. 验证
const verify = ['dist/static/js/ziwei-engine.js', 'dist/static/js/domain-analysis.js', 'dist/ep8-ziwei.html'];
verify.forEach((v) => {
  const p = path.join(root, v);
  if (!fs.existsSync(p)) {
    console.error(`✗ 缺失: ${v}`);
    process.exit(1);
  }
});
console.log('✓ 构建完成，dist 目录已生成');
