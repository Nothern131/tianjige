# EP10 周公解梦 Experience Page 设计文档

> 创建时间：2026-10-29
> 状态：待评审

## 背景

EP8 已做紫微斗数、EP9 已做大六壬。当前 10 个引擎中，「周公解梦」是唯一**引擎与主站组件已完成、但没有独立体验页**的模块，故定为 EP10。

## 目标

创建周公解梦独立体验页（ep10-zhougong.html），完整展示梦境元素匹配 → 逐条破解 → 五行归属 → 综合吉凶 → 事域交叉分析 → 周公点评。

## 边界

- 复用已有 `zhougong-engine.js`（全局 `ZhougongEngine.divine(text, question)`）
- 复用已有 `masters-engine.js` + `components/masters.js`（`renderMastersPanel`，按 `category === '解梦'` 过滤，仅 1 位大师：周公）
- **不使用 `domain-analysis.js`**：周公引擎自带 `questionAnalysis`（梦境→事域映射表 100+ 条），比 `DomainAnalysis.analyze('zhougong')`（复用诸葛签文模板）更贴合
- 不新增引擎逻辑，只做前端展示层
- 风格与 EP1-EP9 完全一致（暗色 `--ink`、金色 `--gold` 系、`Noto Serif SC`+`Ma Shan Zheng`、玻璃卡片、stagger 入场、`prefers-reduced-motion` 降级、水墨粒子 canvas）
- 输入无需日期/时辰：梦境文本（必填）+ 事域标签（可选，自动填充问题）+ 所问之事（可选）+ 随机梦境

## 完成标准

- [ ] `ep10-zhougong.html` 构建成功（`node build.js` 输出 dist 且可访问 `/ep10-zhougong.html`）
- [ ] 输入梦境后生成：匹配条目卡片（关键词/分类/吉凶/解读）、综合吉凶、分类与条目数
- [ ] 综合解读 + 问事分析正常渲染（`interpretation` / `questionAnalysis`）
- [ ] 周公点评面板正常渲染（`category === '解梦'`）
- [ ] 空输入/无匹配梦境均不报错、有兜底文案
- [ ] dist 同步、首页入口可见
- [ ] 视频介绍词 + 简介产出

## 设计

### 页面结构

```
Hero → 01 描述梦境 → 02 梦境解构（元素卡片 + 吉凶总览） → 03 综合解读（含问事分析） → 04 周公点评 → 免责声明
```

### 01 描述梦境

- 梦境描述 `textarea`（必填，`min-height:100px`，Ctrl+Enter 提交）
- 快捷梦境标签（16 个：蛇/鱼/水/火/飞/坠落/牙齿/考试/死人/棺材/龙/钱/花/树/房子/车），点击填入「梦见X」
- 事域标签（💼事业 💕感情 💰财运 🏥健康 📚学业 🏠家庭 👯人际 ✈️出行），点击自动填充问题
- 所问之事输入框（可选）
- 按钮：🌙 解梦推演 / 🎲 随机梦境

### 02 梦境解构

- `info-panel` 五项：匹配条目 / 涉及分类 / 综合吉凶 / 吉象数 / 凶象数
- 条目卡片网格（`result.results`）：分类图标 + 关键词 + 吉/中/凶徽章 + 解读正文
- 逐卡 stagger 入场
- 无匹配时展示引擎兜底解读，不渲染卡片网格

### 03 综合解读

- `result.interpretation` 按 `\n` 分段，`white-space:pre-wrap`
- `result.questionAnalysis` 存在时追加「所问之事」区块（蓝色左边框区分）
- 底部展示「五行归属」摘要：按引擎 `WUXING_CAT` 同源词表本地统计

### 04 周公点评

- 复用 `renderMastersPanel`
- `category: '解梦'`，`masters` = `MastersEngine.MASTERS` 过滤 `category === '解梦'`（当前仅周公）
- `analysisTypes`：[全盘解梦 / 梦境拆解 / 吉凶研判 / 事域研判]
- `onAnalyze` → `buildZhougongAnalysis(result, masterId, analysisType)` 五段式，模板取自 `master.openingTemplates/quoteTemplates/closingTemplates[0]`，占位符替换为梦象语境的数值
- 增强维度（仿 EP9）：细节拆解（逐条梦境元素）/ 五行归经 / 背景关联（周公梦学渊源）/ 延伸参考
- 追问区（仿 EP9 `#zhougong-followup`）

### 免责声明

周公解梦是中国传统文化的一部分，属于古典术数和文化遗产范畴。本系统仅供文化研究和娱乐参考，不构成任何人生决策建议。请相信科学，理性看待命运。

## 技术要点

1. `ZhougongEngine.divine(text, question)` → `{ input, question, results[], interpretation, questionAnalysis, domain, ji, categories[], count }`
2. 单条梦境 `{ keyword, cat, ji, interpretation }`；分类中文名需页面内映射 `CATEGORIES`
3. 五行统计：页面内维护与引擎 `WUXING_CAT` 同源的关键词表，统计匹配条目主导五行
4. 大师分析占位符：`{日主}`→梦中主导元素 / `{日主五行}`→主导五行 / `{旺衰}`→综合吉凶 / `{事域}` / `{结论}` / `{建议}` / `{分数}`
5. 增强模块渲染沿用 EP9 `renderEnhancedModules` + `sectionLabel/sectionBody` 模式，延迟插入避免与主分析冲突
6. masters.js 使用 `.master-avatar/.master-name/.tab-btn/.btn-gold/.master-result-*` 类名，本页需补全这些样式（EP9 的 `.mc-*` 与实际类名不符，不复用）

## 文件清单

| 文件 | 操作 |
|------|------|
| `ep10-zhougong.html` | 新建（复用 EP9 视觉 + 周公引擎 + 周公大师 + 动效） |
| `vite.config.js` | 添加 build entry `ep10-zhougong` |
| `build.js` | `htmlFiles` 数组补充 `ep10-zhougong.html`，verify 增加新页面 |
| `index.html` | EP 导航补充 EP9/EP10 入口 |
| `kb/项目总览.md` | 体验页状态表按实际顺序更新（EP8 紫微 / EP9 大六壬 / EP10 周公解梦） |
| `docs/EP10周公解梦-视频介绍词.md` | 新建 |
| `docs/EP10周公解梦-视频简介.md` | 新建 |
