# 天机阁 · 传统知识推理系统

> **定位**：多领域传统知识计算引擎 + 结构化规则推理 + 34位大师风格分析
> **版本**：2.1.0（纯前端架构）
> **核心技术**：Vanilla JS / Vite / 零依赖 / 零API

---

## 项目定位

天机阁是一个**纯前端传统知识推理系统**，将中国传统术数（八字命理、紫微斗数、奇门遁甲、六爻纳甲、梅花易数、太乙神数等）的复杂排盘算法封装为自动化计算引擎，所有计算在浏览器本地完成，零外部API依赖。

- **多体系排盘**：10种术数引擎，所有算法本地运行
- **规则推理**：基于天干地支、五行生克、神煞格局的结构化规则系统
- **多术合参**：跨体系加权融合分析
- **大师风格**：34位古今大师的断命风格模拟
- **黄金测试集**：95组标准用例，100%通过率

---

## 系统架构

```
浏览器 (HTML5/CSS3/ES6+)
    │
    ▼
引擎层 (Engines)
    ├── 八字引擎 (bazi-engine.js)     — 四柱排盘、十神、格局、旺衰
    ├── 六爻引擎 (liuyao-engine.js)   — 铜钱起卦、纳甲装卦、六亲六兽
    ├── 梅花引擎 (meihua-engine.js)   — 三数起卦、互卦变卦、体用生克
    ├── 奇门引擎 (qimen-engine.js)    — 地盘天盘人盘神盘、八门九星
    ├── 太乙引擎 (taiyi-engine.js)    — 太乙积年、十六神
    ├── 诸葛引擎 (zhuge-engine.js)    — 384签计算、签文解读
    ├── 周公引擎 (zhougong-engine.js) — 梦境关键词匹配
    ├── 大六壬引擎 (daliuren-engine.js) — 天地盘、四课三传
    ├── 紫微引擎 (ziwei-engine.js)    — 命宫安立、十二宫、十四主星
    └── 风水引擎 (fengshui-engine.js) — 玄空飞星、九宫分析
    │
    ▼
引擎注册中心 (engine-registry.js)
    │   统一管理所有引擎的注册、参数构建、调度执行
    ▼
常量库 (constants.js)
    │   天干地支、五行生克、纳音、八卦等基础数据
    ▼
合参引擎 (composite-engine.js)
    │   多引擎结果加权融合、冲突解决
    ▼
界面层 (components/*.js)
    │   各术数对应的前端交互组件
```

### 目录结构

```
天机阁/
├── index.html              # 主页入口
├── package.json            # 依赖与脚本
├── vite.config.js          # Vite 构建配置
├── .eslintrc.cjs           # ESLint 配置
├── .prettierrc             # Prettier 配置
├── .github/workflows/      # GitHub Actions 部署
│   └── deploy.yml
├── static/
│   ├── css/
│   │   └── style.css       # 全局样式
│   └── js/
│       ├── constants.js    # 常量库（天干地支五行等）
│       ├── logger.js       # 日志工具
│       ├── engine-registry.js  # 引擎注册中心
│       ├── composite-engine.js   # 多引擎合参
│       ├── duality-analyzer.js   # 阴阳二气分析
│       ├── bazi-engine.js    # 八字引擎
│       ├── liuyao-engine.js  # 六爻引擎
│       ├── meihua-engine.js  # 梅花易数引擎
│       ├── qimen-engine.js   # 奇门遁甲引擎
│       ├── taiyi-engine.js   # 太乙神数引擎
│       ├── zhuge-engine.js   # 诸葛神数引擎
│       ├── zhougong-engine.js # 周公解梦引擎
│       ├── daliuren-engine.js # 大六壬引擎
│       ├── ziwei-engine.js   # 紫微斗数引擎
│       ├── fengshui-engine.js # 风水引擎
│       ├── masters-engine.js # 34位大师引擎
│       ├── user-profile.js   # 用户命簿
│       └── components/       # 前端交互组件
│           ├── bazi.js
│           ├── liuyao.js
│           ├── meihua.js
│           ├── qimen.js
│           ├── ziwei.js
│           ├── taiyi.js
│           ├── zhuge.js
│           ├── zhougong.js
│           ├── daliuren.js
│           ├── fengshui.js
│           ├── composite.js
│           ├── masters.js
│           └── profile.js
├── tests/
│   ├── golden_set.json     # 95组黄金测试用例
│   ├── test_runner.js      # 测试运行器（Node.js + Browser）
│   ├── run_tests.js        # Node.js 入口
│   ├── test_browser.js     # Browser 入口
│   ├── index.html          # Web 测试面板
│   └── gen_expected.js     # 预期输出生成器
├── docs/                   # 项目文档
│   ├── 天机阁工程化架构设计.md
│   ├── 纯前端工程化改造.md
│   └── 项目技术总结文档_v1.0.md
└── kb/                     # 知识库
    ├── 项目总览.md
    └── 各引擎文档/
```

---

## 核心技术

| 技术 | 用途 |
|------|------|
| Vanilla JS (ES6+) | 所有引擎与组件实现 |
| Vite 5.x | 构建工具与开发服务器 |
| CSS3 | 响应式布局、动画、玻璃拟态 |
| Node.js 20+ | 测试运行、本地开发 |
| GitHub Pages | 静态部署 |

---

## 启动方式

### 本地开发（需 Node.js 20+）

```bash
npm install
npm run dev       # 开发服务器 http://localhost:8889
npm run build     # 构建到 dist/
npm run preview   # 预览构建产物
```

### 代码质量

```bash
npm run lint      # ESLint 检查
npm run format    # Prettier 格式化
```

### 测试

```bash
npm test          # 运行黄金测试集（95组用例）
```

测试覆盖所有10个引擎：
- **八字** 40组（含节气边界、早晚子时）
- **六爻** 20组（铜钱法起卦）
- **梅花** 30组（数字法起卦）
- **常量** 3组（天干地支、八卦完整性）
- **引擎注册** 2组（引擎可用性）

### 一键部署

直接推送到 `master` 分支，GitHub Actions 会自动构建并部署到 gh-pages。

---

## 10大计算引擎

| 引擎 | 类别 | 核心算法 | 入口方法 |
|------|------|----------|----------|
| 八字 | 命盘 | 四柱排盘、十神、格局、旺衰、用神、大运 | `BaziEngine.paipan(year, month, day, hour)` |
| 紫微斗数 | 命盘 | 命宫安立、十二宫、十四主星、四化飞星 | `ZiweiEngine.paipan(...)` |
| 奇门遁甲 | 时空 | 地盘天盘人盘神盘、八门九星八神 | `QimenEngine.paipan(...)` |
| 六爻纳甲 | 即时 | 铜钱起卦、纳甲装卦、六亲六兽、世应 | `LiuyaoEngine.divine(yaoArray)` |
| 梅花易数 | 即时 | 三数起卦、互卦变卦、体用生克 | `MeihuaEngine.divine(params)` |
| 太乙神数 | 时空 | 太乙积年、十六神、五福三基 | `TaiyiEngine.paipan(...)` |
| 诸葛神数 | 即时 | 384签计算、签文解读 | `ZhugeEngine.divine(...)` |
| 周公解梦 | 文本 | 梦境关键词匹配 | `ZhougongEngine.interpret(text)` |
| 大六壬 | 时空 | 天地盘、四课三传 | `DaLiuRenEngine.paipan(...)` |
| 风水格局 | 空间 | 玄空飞星、九宫分析 | `FengShuiEngine.analyze(...)` |

---

## 常量库 (constants.js)

所有引擎共享的基础数据，通过 `Tianjige.Const` 暴露：

| 属性 | 说明 |
|------|------|
| `GAN` | 十天干数组 (10) |
| `ZHI` | 十二地支数组 (12) |
| `SIXTY_JIAZI` | 六十甲子数组 (60) |
| `NAYIN_ARR` | 纳音数组 (120) |
| `BAGUA` | 八卦对象 (8) |
| `WUXING` | 五行对象 |
| `WX_SHENG` / `WX_KE` | 五行生克关系 |
| `JIAZI_INDEX` | 甲子索引表 |

---

## 测试

```bash
# 运行黄金测试集
npm test

# 浏览器内运行测试面板
open tests/index.html
```

测试运行器兼容 Node.js 和浏览器环境，`tests/test_runner.js` 通过 IIFE 注入到全局上下文后运行。

---

## 扩展方式

### 新增术数引擎

1. 在 `static/js/` 下创建引擎文件，使用 IIFE 模式暴露到全局
2. 在 `engine-registry.js` 中注册引擎配置
3. 在 `components/` 下创建对应的前端交互组件
4. 在 `tests/golden_set.json` 中添加测试用例

```javascript
// 引擎文件模板
(function(global) {
  'use strict';

  function divine(params) {
    // 纯算法计算
    return { ... };
  }

  global.NewEngine = {
    divine: divine,
    // 常量数据
  };
})(typeof window !== 'undefined' ? window : this);
```

---

## 设计原则

- **纯前端计算**：所有算法在浏览器本地运行，零后端依赖
- **零外部API**：不依赖任何第三方AI或计算服务
- **可解释推理**：每次分析输出完整计算过程
- **模块化引擎**：各引擎独立开发，通过注册中心统一管理
- **黄金测试集**：95组标准用例覆盖核心算法，确保回归安全

---

## License

MIT
