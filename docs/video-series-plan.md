# 天机阁 · 视频系列计划

> 目标：每个术数引擎独立讲解 + 体验链接，逐一发布视频，最终汇总为完整系列。

---

## 视频系列：《天机阁 · 术数引擎深度解析》

### 整体策略
- 每个视频讲解一个独立术数引擎
- 视频下方附带体验链接（GitHub Pages 独立页面）
- 体验页独立单文件，不依赖天机阁主站
- 每个体验页含代码保护（右键/F12拦截 + 控制台版权声明）
- 视频发布后再建 GitHub 仓库部署

---

## 模块清单（12个视频）

| 序号 | 模块 | 引擎文件 | 输入类型 | 体验页文件 | 视频主题 |
|------|------|---------|---------|-----------|---------|
| EP1 | 风水格局 | fengshui-engine.js | 时空类 | ep1-fengshui.html | 玄空飞星 · 九宫飞泊 · 年星吉凶 |
| EP2 | 八字排盘 | bazi-engine.js | 命盘类 | ep2-bazi.html | 四柱推命 · 十神 · 大运流年K线 |
| EP3 | 六爻占卜 | liuyao-engine.js | 即时类 | ep3-liuyao.html | 纳甲装卦 · 世应 · 六兽 |
| EP4 | 梅花易数 | meihua-engine.js | 即时类 | ep4-meihua.html | 体用生克 · 三要十应 |
| EP5 | 奇门遁甲 | qimen-engine.js | 时空类 | ep5-qimen.html | 九宫八门 · 九星 · 时空推演 |
| EP6 | 太乙神数 | taiyi-engine.js | 时空类 | ep6-taiyi.html | 太乙九宫 · 利主利客 |
| EP7 | 诸葛神数 | zhuge-engine.js | 即时类 | ep7-zhuge.html | 三数测事 · 384签 |
| EP8 | 周公解梦 | zhougong-engine.js | 文本类 | ep8-zhougong.html | 梦境解析 · 梦象反推 |
| EP9 | 大六壬 | daliuren-engine.js | 时空类 | ep9-daliuren.html | 天地盘 · 四课三传 |
| EP10 | 紫微斗数 | ziwei-engine.js | 命盘类 | ep10-ziwei.html | 十二宫垣 · 星曜四化 |
| EP11 | 合参引擎 | composite-engine.js | 融合 | ep11-composite.html | 多术数融合 · 融洽磨合 |
| EP12 | 大师蒸馏 | masters-engine.js | 蒸馏 | ep12-masters.html | 34位大师 · 五段式分析 |

---

## 第一期：风水格局（EP1）

### 视频内容
1. 玄空飞星基础概念（三元九运、二十四山、九宫飞泊）
2. 运星/山星/向星/年星四层飞星排盘
3. 九宫格可视化展示
4. 宫位吉凶评估（五黄/二黑/八白/九紫等九星）
5. 最佳/最差方位分析
6. 实际案例演示（输入坐向→查看风水格局）

### 体验页功能
- 输入：建房年份 / 坐山（24山选择器） / 朝向 / 当前年份
- 输出：九宫飞星盘（四层星曜标签可视化） / 总体评分 / 最佳/最差方位 / 九宫详表
- 代码保护：右键拦截 / F12拦截 / 控制台版权声明

### 体验页文件
- `ep1-fengshui.html`（独立单文件，内嵌CSS+JS）

### 部署
- 仓库：新建 `tianji-fengshui`（Public）
- Pages：gh-pages 分支
- 链接：`https://nothern131.github.io/tianji-fengshui/ep1-fengshui.html`

---

## 后续优化方向
- 风水引擎算法增强（二十四山兼向、替卦、城门诀）
- 八字引擎增加K线图交互
- 合参引擎增加更多术数组合
- 大师蒸馏增加更多大师风格