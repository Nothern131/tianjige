# EP9 大六壬 Experience Page 设计文档

> 创建时间：2026-10-14
> 状态：待评审

## 目标

创建大六壬独立体验页（ep9-daliuren.html），完整展示天地盘 + 四课 + 三传 + 十二天将 + 课体吉凶 + 全文解读 + 大师点评，支持公历日期 + 时辰起课。

## 边界

- 复用已有 `daliuren-engine.js`（全局 `DaLiuRenEngine.divine(dateStr, hourNum)`，hourNum 0-11，子时=0）
- 复用已有 `masters-engine.js` + `components/masters.js`（`renderMastersPanel`，按 `category === '大六壬'` 过滤，4 位大师：邵彦和/陈公献/郭御青/程树勋）
- 复用已有 `domain-analysis.js`（事域分析 `DomainAnalysis.analyze('daliuren', result, question)`）
- 不新增引擎逻辑，只做前端展示层
- 风格与 EP1-EP8 完全一致（暗色 `--ink`、金色 `--gold` 系、`Noto Serif SC`+`Ma Shan Zheng`、玻璃卡片、stagger 入场、`prefers-reduced-motion` 降级、水墨粒子 canvas）
- 大六壬无需农历双模式、无需性别，输入区简化为：公历日期 + 时辰 + 事域 + 提问

## 完成标准

- [ ] `ep9-daliuren.html` 构建成功（本地 Vite 可访问 `/ep9-daliuren`）
- [ ] 输入公历日期 + 时辰后，生成完整课式：天盘 12 格、四课、三传、十二天将、课体吉凶、全文解读
- [ ] 大师点评面板正常渲染（4 位大六壬大师）
- [ ] 事域分析正常调用 `DomainAnalysis.analyze('daliuren', ...)`
- [ ] dist 同步（PowerShell 拷贝，Windows 下 `node build.js` 崩溃）
- [ ] 视频介绍词 + 简介产出（`docs/EP9大六壬-视频介绍词.md`/`EP9大六壬-视频简介.md`）

## 设计

### 页面结构

```
Hero → 01 起课参数 → 02 课式总览（天盘+四课+三传+十二天将） → 03 课体研判 → 04 大师点评 → 免责声明
```

### 01 起课参数

- 起课日期（`input type=date`，默认当天，`min=1900-01-01`/`max=2100-12-31`）
- 占时（`select`：子时~亥时 12 项，value 中文，默认 巳时；经 `hourMap` 转 `hourNum` 0-11）
- 事域标签（💼事业 💕感情 💰财运 🏥健康 📚学业 🏠家庭 👯人际 ✈️出行，复用 EP8 `.domain-tag`）
- 提问输入框（可选，点击事域自动填充）
- 起课按钮（🔮 起课推演）

### 02 课式总览

- **天盘 12 格**（替换 EP8 紫微 4×4 命盘格子）：十二地支环形布局，每格显示 地盘地支 + 天盘叠压地支 + 该位天将（`result.tian_jiang`）；十二格用 `grid` 环形排布（3×4 + 中心课体信息），stagger 入场
- **四课**（`result.si_ke`）：ke1~ke4 各显示 下+上
- **三传**（`result.san_chuan`）：初→中→末，每传显示 地支 + 月将名（`JIANG_NAMES`）+ 天将（`tian_jiang`）
- **十二天将**（`result.tian_jiang`）：贵人~天后 顺逆排布说明
- **基本信息**（`info-panel`）：起课日期、占时、月将（`yue_jiang_name`）、日干（`ri_gan`）、日支（`ri_zhi`）

### 03 课体研判

- 课体名称（`result.ke_name`）+ 吉凶等级（`result.level`：吉/中平/偏凶，配色 金/灰/红）
- 三传路径（`result.chuan`：如"子→午→亥"）
- 全文解读（`result.interpretation`，按 `\n` 分段渲染，`white-space:pre-wrap`，含【课体】【三传】【四课】【天将】【六亲】【研判】【邵彦和按】分段）

### 04 大师点评

- 复用 `renderMastersPanel`
- `category: '大六壬'`，`masters` = `MastersEngine.MASTERS` 过滤 `category === '大六壬'`
- `analysisTypes`：[全盘解读 / 课体研判 / 三传研判 / 初传研判]
- `onAnalyze` → `buildDaliurenAnalysis(result, masterId, analysisType)` 五段式（仿 EP8 `buildZiweiAnalysis`，从 `master.openingTemplates/quoteTemplates/closingTemplates[0]` 取模板替换占位符 `{日主}/{事域}/{结论}/{建议}/{分数}`）
- 追问区（仿 EP8 `#ziwei-followup`）

### 免责声明

大六壬是中国传统文化的一部分，属于古典术数和文化遗产范畴。本系统仅供文化研究和娱乐参考，不构成任何人生决策建议。请相信科学，理性看待命运。

## 技术要点

1. `DaLiuRenEngine.divine(dateStr, hourNum)` → result
   - `dateStr` 格式 `YYYY-MM-DD`；`hourNum` 0-11（子=0,丑=1,...亥=11）
   - 返回：`date/zhan_shi/yue_jiang/yue_jiang_name/ri_gan/ri_zhi/tian_pan/si_ke/san_chuan{chu,zhong,mo,type,keInfo}/tian_jiang/ke_name/chuan/interpretation/level`
2. 公开 API：`{ divine, getYueJiang, JIANG_NAMES, ZHI, GAN }`；六亲未公开，页面如需要需自实现（本期省略，依赖 `interpretation` 内含六亲段）
3. 天盘 12 格布局：地支环（子丑寅卯辰巳午未申酉戌亥）环形，中心放课体/吉凶
4. `buildDaliurenAnalysis` 仿 EP8 `buildZiweiAnalysis`（行 1616-1697）五段式
5. `initDaliurenMasters` 仿 EP8 `initZiweiMasters`（行 1708-1735），过滤 `category === '大六壬'`
6. 复用 EP8 `showToast`、水墨粒子 IIFE、stagger 动效
7. 不新增 `initDaliurenMastersPanel`（EP 页面无需反向同步主站）

## 文件清单

| 文件 | 操作 |
|------|------|
| `ep9-daliuren.html` | 新建（复用 EP8 视觉 + 大六壬引擎 + 4 位大师 + 动效） |
| `vite.config.js` | 添加 build entry `ep9-daliuren` |
| `docs/EP9大六壬-视频介绍词.md` | 新建 |
| `docs/EP9大六壬-视频简介.md` | 新建 |
