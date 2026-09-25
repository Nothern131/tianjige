# EP8 紫微斗数 Experience Page 设计文档

> 创建时间：2026-09-25
> 状态：待评审

## 目标

创建紫微斗数独立体验页（ep8-ziwei.html），完整展示十二宫星曜分布，支持自动排盘 + 逐步解读。

## 边界

- 复用已有 `ziwei-engine.js`（全局 `ZiWeiEngine.paipan()`）
- 复用已有 `masters-engine.js` + `masters.js`（大师点评面板）
- 复用已有 `domain-analysis.js`（事域分析）
- 不新增引擎逻辑，只做前端展示层
- 风格与 EP1-EP7 一致（水墨背景、金色系、section编号卡片）

## 完成标准

- [ ] `ep8-ziwei.html` 构建成功
- [ ] 浏览器可访问 `/ep8-ziwei`
- [ ] 输入出生日期+时辰+性别后，生成完整命盘（12宫全部展示）
- [ ] 大师点评面板正常渲染
- [ ] 主站 ziwei 组件同步挂载 `initZiweiMastersPanel`

## 设计

### 页面结构

```
Hero → 01 起盘参数 → 02 命盘总览 → 03 十二宫详细解读 → 04 大师点评 → 免责声明
```

### 01 起盘参数

- 出生日期（date input，默认 2000-01-01）
- 出生时辰（select：子时~亥时，默认 巳时）
- 性别（select：男/女，默认 男）
- 事域标签（💼事业 💕感情 💰财运 🏥健康 📚学业 🏠家庭 👯人际 ✈️出行）
- 问题输入框（可选）
- 排盘按钮

### 02 命盘总览

- 农历年月日、年干支
- 命宫、身宫位置
- 五行局
- 四化（禄权科忌）
- 命宫主星
- 总体运势判断
- 十二宫星曜分布简表（12宫 × 主星一行）

### 03 十二宫详细解读

每个宫位一张独立卡片（共12张），按命宫→兄弟→夫妻→子女→财帛→疾厄→迁移→交友→官禄→田宅→福德→父母的顺序排列：
- 宫名 + 干支 + 命/身标记
- 星曜列表（主星加粗，辅星普通）
- 该宫位解读（从 engine interpretation 文本提取对应内容）

### 04 四化详情

- 简表：一行展示 年干→化禄X 化权X 化科X 化忌X
- 详细：标注每个四化星落在哪个宫（如"化禄入财帛宫"）

### 05 大师点评

- 复用 `renderMastersPanel`
- category: 'ziwei'
- 调用 `initZiweiMastersPanel`

### 事域分析

- 选择事域后，调用 `DomainAnalysis.analyze('ziwei', result, question)`
- 展示分析结果

## 技术要点

1. `ZiWeiEngine.paipan({year, month, day, hour, gender})` → result
2. result 包含：农历年/月/日、年干支、命宫、身宫、五行局、四化、十二宫数组、interpretation文本、总体运势
3. 十二宫数组每项：name, zhi, ganZhi, stars[], isMingGong, isShenGong
4. 主星 = 十四主星列表，其余为辅星
5. 不新增 `initZiweiMastersPanel`（EP页面无需反向同步主站）

## 文件清单

| 文件 | 操作 |
|------|------|
| `ep8-ziwei.html` | 新建 |
| `vite.config.js` | 添加 build entry |
| `static/js/components/ziwei.js` | 添加 `initZiweiMastersPanel` |
