/**
 * 综合测试：验证score/trend计算和大师分析差异化
 */
const fs = require('fs');
const path = require('path');

// 全局模拟
global.window = global;

// 加载引擎文件
function loadJS(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    eval(code);
  } catch (e) {
    console.error(`[ERROR] 加载 ${filePath} 失败:`, e.message);
    throw e;
  }
}

// 按顺序加载
const distDir = 'E:\\天机阁\\dist';
const files = [
  'static/js/constants.js',
  'static/js/liuyao-engine.js',
  'static/js/masters-engine.js',
  'static/js/domain-analysis.js',
];

console.log('=== 加载引擎文件 ===');
for (const f of files) {
  const fp = path.join(distDir, f);
  console.log(`  加载: ${f}...`);
  try {
    loadJS(fp);
    console.log(`  ✓ ${f} 加载成功`);
  } catch (e) {
    console.error(`  ✗ ${f} 加载失败:`, e.message);
    process.exit(1);
  }
}

// 测试不同卦象的score/trend
console.log('\n=== 测试不同卦象的吉凶分数 ===');

const testCases = [
  { name: '乾为天', lines: [1,1,1,1,1,1] },
  { name: '坤为地', lines: [0,0,0,0,0,0] },
  { name: '水火既济', lines: [1,0,1,0,1,0] },
  { name: '火水未济', lines: [0,1,0,1,0,1] },
  { name: '雷水解', lines: [0,0,1,1,0,1] },
  { name: '水雷屯', lines: [1,0,1,1,0,0] },
];

for (const tc of testCases) {
  try {
    const lines = tc.lines.map(v => ({ type: v ? 'yang' : 'yin', changing: false }));
    const result = LiuyaoEngine.divine(lines);
    console.log(`  ${tc.name}: score=${result.score}, trend=${result.trend}`);
    console.log(`    日月建: ${result.ri_jian}/${result.yue_jian}`);
    console.log(`    旺衰: ${result.wang_shuai ? result.wang_shuai.join(',') : '无'}`);
    if (result.chong_he) {
      console.log(`    六冲六合: 六冲=${result.chong_he.isLiuChong}, 六合=${result.chong_he.isLiuHe}`);
    }
  } catch (e) {
    console.log(`  ${tc.name}: 失败 - ${e.message}`);
  }
}

// 测试带动爻的卦
console.log('\n=== 测试带动爻的卦象 ===');
const movingLines = [
  { name: '乾之夬', lines: [1,1,1,1,1,1], moving: [1] },
  { name: '坤之比', lines: [0,0,0,0,0,0], moving: [2] },
];

for (const tc of movingLines) {
  try {
    const lines = tc.lines.map((v, i) => ({
      type: v ? 'yang' : 'yin',
      changing: tc.moving.includes(i + 1)
    }));
    const result = LiuyaoEngine.divine(lines);
    console.log(`  ${tc.name}: score=${result.score}, trend=${result.trend}, 动爻=${result.dong_yao}`);
  } catch (e) {
    console.log(`  ${tc.name}: 失败 - ${e.message}`);
  }
}

console.log('\n=== 测试完成 ===');
