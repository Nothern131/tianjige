# EP1 / EP2 / EP3 详解增强 Spec

## 1. 目标

在现有三页上做**最小、可验证、不改变排盘算法**的详解增强：

- EP1 风水：补「三元龙坐向速查表」与「关键方位速查」两个区块。
- EP2 八字：藏干补「本气 / 中气 / 余气」层级，补「十神力量分布（含藏干）」汇总。
- EP3 六爻：把三起卦方式写入结果、补卦宫信息、把引擎已算出的神煞显示到排盘表。

不新增依赖、不新增抽象层、不改 `static/js/*-engine.js`、不改评分逻辑。

## 2. 现状审计（已完成）

| 页面 | 已存在 | 缺口 |
| --- | --- | --- |
| `ep1-fengshui.html` | 11 个详解区块：总体评估/元运/坐向/九宫逐一/特殊格局/旺财旺丁/化煞/流年/调理 | 坐向分析只有文字，无二十四山三元龙对照；无跨宫位的财/丁/文昌/喜庆/煞位速查 |
| `ep2-bazi.html` | 藏干表已渲染 `藏干 + 十神` | 未区分本气/中气/余气；无十神力量汇总 |
| `ep3-liuyao.html` | 三种起卦：铜钱摇卦 / 一键起卦 / 手工指定；排盘表有爻位/阴阳/动/六亲/六兽/纳甲 | `doDivine(lines, source)` 的 `source` 未被使用，结果不显示起卦方式；未显示 `original_gua.gong`；`result.shen_sha` 已计算但未渲染 |

## 3. 改动清单（精确到插入位置）

### 3.1 `ep1-fengshui.html`

#### A. 三元龙坐向速查表

位置：`generateFengshuiAnalysis(result)` 内，坐山朝向分析区块。
锚点：`'）。此为玄空飞星排盘之关键，顺逆有别，吉凶各异。</p>';` 之后，`if (sitGong) {` 之前。

新增局部函数（不导出、不新增全局）：

```js
function sanyuanLong(mountain) {
  if ('子午卯酉乾坤艮巽'.indexOf(mountain) >= 0) return '天元龙';
  if ('辰戌丑未甲庚丙壬'.indexOf(mountain) >= 0) return '地元龙';
  return '人元龙'; // 寅申巳亥乙辛丁癸
}
```

渲染内容：`<div class="table-wrap"><table class="detail-table">`
表头：`项目 | 二十四山 | 所属八卦 | 阴阳 | 三元龙 | 飞星`
两行：坐山 / 朝向。
数据来源：
- `FengshuiEngine.MOUNTAIN_NAMES[mountain]`
- `FengshuiEngine.MOUNTAIN_GUA[mountain]`
- `FengshuiEngine.MOUNTAIN_YINYANG[mountain]`
- `result.mountainShun` / `result.facingShun` → 顺飞 / 逆飞

复用现有 `.detail-table` / `.table-wrap` CSS，无新增样式。

#### B. 关键方位速查

位置：九宫逐一详解区块结束后、特殊格局区块之前。
锚点：九宫逐一详解的 `html += '</div>';`（`// 4.5 三般卦` 之前）。

算法（全部基于 `result.palaces` 已算字段）：

- 财位：`facingStar === 8`，按 `score` 降序取前 2；无则退回 `annualStar === 8`。
- 丁位：`mountainStar === 8`，按 `score` 降序取前 2。
- 文昌位：`periodStar/mountainStar/facingStar` 中任一为 `4` 或 `1`，按 `score` 降序取前 2，去重。
- 喜庆位：任一星为 `9`，按 `score` 降序取前 2，去重。
- 煞位：`annualStar` 为 `5` 或 `2` 的宫位，明确标注「五黄 / 二黑」。

渲染为一个 `analysis-block`：
- 标题：`<h4><span class="icon">🧭</span>关键方位速查</h4>`
- 每类一行：`方位名 — 星曜 — 用途/注意`
- 无命中时输出「本年无明显 X 位」，不得留空。
- 星曜名取 `FengshuiEngine.STARS[n].name`。

### 3.2 `ep2-bazi.html`

#### A. 藏干层级标签

- CSS：`.canggan-item .cg-qi` 及修饰类 `qi-ben / qi-zhong / qi-yu`，字号 0.58rem，低饱和金/灰/褐，不改现有布局。
- 渲染：`renderResult` 的藏干循环中，按数组下标标注：
  - `0` → `本气`
  - `1` → `中气`
  - `2` → `余气`
- 单藏干地支（子/卯/酉）仍显示「本气」。

#### B. 十神力量分布

- HTML：藏干表 `</table></div>` 之后新增 `<div id="shishenSummary" class="shishen-summary"></div>`。
- CSS：`.shishen-summary` 顶部细分割线 + 五个 `.ss-item` 横排，窄屏换行。
- 计算（在 `document.getElementById('cangganBody').innerHTML = cangganHtml;` 之后）：
  1. 年/月/时柱的「天干十神」入统计；**排除日柱天干**（避免自指比肩虚增）。
  2. 四柱全部 `地支藏干[i].十神` 入统计。
  3. 归并五类：比劫（比肩/劫财）、食伤（食神/伤官）、财星（正财/偏财）、官杀（正官/七杀/偏官）、印星（正印/偏印/枭神）。
  4. 显示每类计数，最高者加 `.ss-max` 高亮；全为 0 时显示「十神力量均衡」。
- 标题行文案：`十神力量分布（含藏干，日干不计）`。

### 3.3 `ep3-liuyao.html`

#### A. 起卦方式落盘

- `doDivine(lines, source)`：新增
  ```js
  var castMethodLabel = { 'manual-shake': '铜钱摇卦', quick: '一键起卦', specify: '手工指定' }[source] || '铜钱摇卦';
  ```
  并传给 `renderLiuyaoResult(liuyaoResult, question, castMethodLabel)`。
- `renderLiuyaoResult(result, question, castLabel)`：在「核心断语」卡片的趋势徽标后追加一枚方式徽标：
  `<span class="yao-tag" style="...">铜钱摇卦</span>`。
- 不改三种起卦的既有交互与随机逻辑。

#### B. 排盘表补卦宫与神煞

- 排盘表上方新增一行说明：`本卦「X」· 属 Y 宫 · 世在 Z · 应在 W`。
  数据：`result.gua_name`、`result.original_gua.gong`、`yaoPos(shiYao)`、`yaoPos(yingYao)`。
- 表头在「纳甲」后新增 `<th>神煞</th>`。
- 行渲染：由 `result.shen_sha`（结构 `[{ yao: 1-6, sha: ['驿马'|'桃花'] }]`）建映射，单元格显示标签；无则 `—`。
- 不新增列宽硬编码，沿用 `.yao-table` 现有样式。

## 4. 非目标

- 不修改 `fengshui-engine.js`、`bazi-engine.js`、`liuyao-engine.js`。
- 不新增评分维度、不改变任何总分。
- 不重构三页布局、不引入图表库。
- 不做 `dist/` 同步（部署脚本负责构建）。

## 5. 验证证据（必须逐项执行）

### 5.1 语法检查

对三个文件逐一执行：

```powershell
node -e "const fs=require('fs'),vm=require('vm');const s=fs.readFileSync('ep1-fengshui.html','utf8');const m=[...s.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n;\n');new vm.Script(m);console.log('EP1 syntax OK')"
```

EP2 / EP3 同理替换文件名。要求输出 `syntax OK`。

### 5.2 浏览器实测

前置：`http://127.0.0.1:8899` 可访问；失效则在 `E:\天机阁` 启动 `python -m http.server 8899`。

| 页面 | URL | 验收点 |
| --- | --- | --- |
| EP1 | `http://127.0.0.1:8899/ep1-fengshui.html?v=20261102b` | 点击「排盘」后：三元龙表出现 2 行且含「天元龙/地元龙/人元龙」之一；关键方位速查出现至少 3 类且无空项 |
| EP2 | `http://127.0.0.1:8899/ep2-bazi.html?v=20261102b` | 点击排盘后：藏干项含「本气」，多藏干支含「中气/余气」；十神力量分布五项计数总和 > 0 |
| EP3 | `http://127.0.0.1:8899/ep3-liuyao.html?v=20261102b` | 一键起卦后：出现「一键起卦」徽标；排盘表存在「神煞」表头；卦宫行含「属 X 宫」 |

每项输出 PASS / FAIL，FAIL 必须附控制台错误或截图说明。

### 5.3 提交与部署

- 每页独立提交，消息格式 `feat(ep1|ep2|ep3): ...`。
- 推送命令：
  ```powershell
  git -C E:\天机阁 -c http.proxy=http://127.0.0.1:10808 -c https.proxy=http://127.0.0.1:10808 push origin master
  ```
- 推送后查 Actions：
  ```powershell
  $env:HTTPS_PROXY='http://127.0.0.1:10808'; gh run list --limit 3 --json headSha,status,conclusion,displayTitle
  ```

## 6. 回滚方案

- 单页回滚：`git -C E:\天机阁 revert <commit>`。
- 未提交回滚：`git -C E:\天机阁 checkout -- ep1-fengshui.html ep2-bazi.html ep3-liuyao.html`。
- 无数据迁移、无配置变更、无外部依赖变更。

## 7. 风险与反证

| 风险 | 是否致命 | 处置 |
| --- | --- | --- |
| `sanyuanLong` 归类与古籍口径不一致 | 否 | 采用通行三龙表：天元子午卯酉乾坤艮巽、地元辰戌丑未甲庚丙壬、人元寅申巳亥乙辛丁癸 |
| 十神汇总重复计入日干 | 否 | 明确排除日柱天干，只计年/月/时天干 + 四支藏干 |
| `result.shen_sha` 为空导致表格错列 | 否 | 无神煞统一输出 `—`，列数固定 |
| 页面被浏览器缓存 | 否 | 统一 `?v=20261102b` |
| 改动破坏已有大师面板 | 是（需防） | 不改 `analysisContent` 之外结构，不改 `initMastersPanel` 调用顺序；浏览器实测必须覆盖结果区滚动与大师面板渲染 |

## 8. 审批点

请确认后执行；若需调整优先级或去掉任一区块，请在审批时指出。
