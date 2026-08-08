# 天机阁 · 传统知识推理系统

> **定位**：多领域传统知识计算引擎 + 结构化规则推理 + 34位大师风格分析
> **版本**：2.0.0（工程化升级中）
> **核心技术**：Python / 纯代码计算 / 零外部API依赖

---

## 项目定位

天机阁是一个**工程级领域知识推理系统**，将中国传统术数（八字命理、紫微斗数、奇门遁甲、六爻纳甲、梅花易数、太乙神数等）的复杂排盘算法封装为自动化计算引擎，并提供：

- **多体系排盘**：10种术数引擎，所有算法本地运行，零API调用
- **规则推理**：基于天干地支、五行生克、神煞格局的结构化规则系统
- **多术合参**：跨体系加权融合分析，处理多来源结果的冲突与综合
- **大师风格**：34位古今大师的断命风格模拟，策略驱动的个性化分析
- **可解释推理**：每次分析输出完整推理链（输入→计算→规则→知识→解释）

---

## 系统架构

```
用户界面 (HTML5/JS)
    │
    ▼
接入层 (FastAPI / 薄路由)
    │
    ▼
推理管道 (Reasoning Pipeline)
    │
    ├── 引擎层 (Engines) ──────── 八字/紫微/奇门/六爻/梅花/太乙/诸葛/解梦/六壬/风水
    ├── 规则引擎 (Rules) ──────── 可配置规则、条件匹配、优先级排序
    ├── 知识库 (Knowledge) ────── 古籍知识、概念定义、规则出处
    ├── 合参层 (Fusion) ──────── 评分归一化、加权融合、冲突解决
    ├── 大师层 (Masters) ──────── 34位大师分析策略、人设语言风格
    └── 语言层 (Language) ─────── 五段式文本生成、模板引擎
```

### 目录结构

```
天机阁/
├── core/             # 基础框架：常量、日历、引擎接口、数据模型
├── engines/          # 计算引擎：10种术数体系（各含 paipan/analysis/explain）
├── knowledge/        # 知识库：古籍结构化数据、规则库、大师资料
├── rules/            # 规则引擎：可配置规则加载、条件匹配、优先级
├── reasoning/        # 推理层：管道编排、推理链追踪
├── fusion/           # 合参层：多术数结果融合、冲突解决
├── masters/          # 大师层：34位大师策略配置、注册中心
├── language/         # 语言层：五段式生成、模板引擎
├── api/              # API层：v1路由、依赖注入
├── database/         # 数据层：SQLite、分析历史
├── tests/            # 测试：pytest 单元/集成/考试
├── static/           # 前端：HTML/CSS/JS
├── docs/             # 文档：架构设计、迁移方案、API文档
└── scripts/          # 脚本：数据库初始化、知识导入
```

---

## 核心技术

| 技术 | 用途 |
|------|------|
| Python 3.11+ | 后端语言 |
| FastAPI | Web框架 |
| Pydantic | 数据校验 |
| lunar-python | 农历计算（可选依赖） |
| YAML/JSON | 规则配置、知识存储 |
| SQLite | 数据持久化（可选） |
| pytest | 测试框架 |
| Docker | 容器化部署 |

### 引擎接口标准

所有计算引擎实现统一的三阶段接口：

```python
class BaseEngine(ABC):
    def calculate(input) -> Dict  # 纯算法计算
    def analyze(input, calc) -> Dict  # 规则匹配与分析
    def explain(input, calc, analysis) -> str  # 自然语言解释
    def run(input) -> EngineOutput  # 完整管道（含推理链）
```

### 引擎覆盖

| 引擎 | 类别 | 核心能力 | 状态 |
|------|------|----------|------|
| 八字 | 命盘类 | 四柱排盘、十神、格局、旺衰、用神、大运 | ✅ |
| 紫微斗数 | 命盘类 | 命宫安立、十二宫、十四主星、四化飞星 | ✅ |
| 奇门遁甲 | 时空类 | 地盘天盘人盘神盘、八门九星八神 | ✅ |
| 六爻纳甲 | 即时类 | 铜钱起卦、纳甲装卦、六亲六兽、世应 | ✅ |
| 梅花易数 | 即时类 | 三数起卦、互卦变卦、体用生克 | ✅ |
| 太乙神数 | 时空类 | 太乙积年、十六神、五福三基 | ✅ |
| 诸葛神数 | 即时类 | 384签计算、签文解读 | ✅ |
| 周公解梦 | 文本类 | 梦境关键词匹配 | ✅ |
| 大六壬 | 时空类 | 天地盘、四课三传 | ✅ |
| 风水格局 | 空间类 | 玄空飞星、九宫分析 | ✅ |

---

## 启动方式

### 本地开发（纯前端，需 Node.js 20+）

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

### 一键部署

直接推送到 `master` 分支，GitHub Actions 会自动构建并部署到 gh-pages。

---

## 引擎架构

### 计算管道

每个引擎执行三阶段管道，所有计算本地完成，零外部依赖：

```
输入(Input) → calculate() → analyze() → explain() → 输出(Output)
                  │              │            │
                  ▼              ▼            ▼
              排盘计算       规则匹配      文本生成
             纯算法实现     条件+权重    五段式结构
                  │              │            │
                  └──────────────┴────────────┘
                                 │
                                 ▼
                          推理链 (ReasoningChain)
                     记录每一步的输入/规则/知识/解释
```

### 10大计算引擎

| 引擎 | 类别 | 核心算法 | 代码位置 |
|------|------|----------|----------|
| 八字 | 命盘 | 四柱排盘、十神、格局、旺衰、用神、大运 | `core/bazi.py` |
| 紫微斗数 | 命盘 | 命宫安立、十二宫、十四主星、四化飞星 | `core/ziwei.py` |
| 奇门遁甲 | 时空 | 地盘天盘人盘神盘、八门九星八神 | `core/qimen.py` |
| 六爻纳甲 | 即时 | 铜钱起卦、纳甲装卦、六亲六兽、世应 | `core/liuyao.py` |
| 梅花易数 | 即时 | 三数起卦、互卦变卦、体用生克 | `core/meihua.py` |
| 太乙神数 | 时空 | 太乙积年、十六神、五福三基 | `core/taiyi.py` |
| 诸葛神数 | 即时 | 384签计算、签文解读 | `static/js/` |
| 周公解梦 | 文本 | 梦境关键词匹配 | `static/js/` |
| 大六壬 | 时空 | 天地盘、四课三传 | `static/js/` |
| 风水格局 | 空间 | 玄空飞星、九宫分析 | `static/js/` |

### 规则系统

规则以 YAML 配置文件定义，由规则引擎加载、匹配、排序：

```yaml
# rules/configs/bazi_geju.yaml
version: "1.0"
engine: bazi
rules:
  - id: "bazi.geju.zheng-guan"
    name: "正官格"
    category: "格局判断"
    condition: "month_zhi_canggan_benqi_shishen == '正官' AND zheng_guan_count >= 1"
    weight: 1.0
    priority: 10
    source: "《渊海子平》· 论正官"
    explanation: "月令本气为正官，且命局中有正官透出，以正官格论。"
```

### 多术合参

`fusion/` 层实现跨引擎结果融合：评分归一化 → 加权融合 → 冲突检测 → 综合研判。

### 34位大师风格

`masters/` 层定义每位大师的 focus_weights（分析重点权重）、analysis_order（分析顺序）、citation_preferences（引用偏好）、expression（表达方式），通过策略模式驱动个性化分析。

---

## 扩展方式

### 新增术数引擎

1. 创建 `engines/<new_engine>/` 目录
2. 实现 `paipan.py`（计算）、`analysis.py`（分析）、`explain.py`（解释）
3. 继承 `core.interfaces.BaseEngine`，实现三阶段接口
4. 在 `core/engine_registry.py` 注册引擎

```python
# engines/<new_engine>/paipan.py
from core.interfaces import BaseEngine, EngineInput

class NewEngine(BaseEngine):
    name = "new_engine"
    version = "1.0.0"

    def calculate(self, input: EngineInput) -> Dict:
        # 纯算法计算
        ...

    def analyze(self, input: EngineInput, calculation: Dict) -> Dict:
        # 规则匹配与分析
        ...

    def explain(self, input: EngineInput, calculation: Dict, analysis: Dict) -> str:
        # 自然语言解释
        ...
```

### 新增分析规则

在 `rules/configs/` 下添加或修改YAML文件：

```yaml
version: "1.0"
engine: bazi
rules:
  - id: "bazi.new_rule"
    name: "新规则"
    category: "格局判断"
    condition: "条件表达式"
    weight: 1.0
    priority: 10
    source: "《古籍》· 出处"
    explanation: "规则解释"
```

### 新增大师风格

在 `masters/profiles/` 下添加YAML文件：

```yaml
id: new_master
name: 新大师
title: 称号
era: 朝代
category: 八字
strategy:
  focus_weights:
    格局分析: 0.4
    五行生克: 0.3
    ...
  analysis_order: [...]
  citation_preferences: {...}
  expression: {...}
templates:
  opening: [...]
  closing: [...]
  quotes: [...]
```

---

## 测试

```bash
# 运行所有测试
pytest tests/ -v

# 运行冒烟测试
python test_all.py

# 运行考试系统（准确率检查）
python test_exam.py

# 仅运行单元测试
pytest tests/unit/ -v

# 仅运行引擎测试
pytest tests/unit/engines/ -v
```

---

## 文档

- [工程化架构设计](docs/天机阁工程化架构设计.md)
- [渐进式迁移方案](docs/天机阁渐进式迁移方案.md)
- [项目技术总结](docs/项目技术总结文档_v1.0.md)
- [项目总览](kb/项目总览.md)

---

## 设计原则

- **纯代码计算**：所有算法本地运行，不依赖外部API
- **可解释性**：每次分析输出完整推理链
- **可配置性**：规则和知识以YAML/JSON文件存储，非开发者可调整
- **可扩展性**：新增引擎只需实现三阶段接口，无需修改核心框架
- **版本管理**：引擎、规则、知识三层独立版本追踪

---

## License

MIT