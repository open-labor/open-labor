# open-labor

> **解码软件研发的高阶暗知识与工程哲学**
> 对齐传统互联网大厂（P6–P10）与前沿 AI-Native 组织的思考模型、决策取舍与工作流实践。

---

## 📖 项目愿景 (Vision)

国内大厂的公开晋升文档与胜任力模型（Competency Models）长期处于抽象同质化状态：

* P6 叫"独立交付"，P7 叫"端到端与领域专家"，P8 叫"架构愿景与跨域协同"，P9 叫"业务破局与生态闭环"。
* 面试八股文与汇报 PPT 技巧满天飞，但**特定段位下如何思考、破局、做取舍的隐性实践知识（Tacit Knowledge）始终处于"黑盒"状态**。

与此同时，软件研发范式正经历历史性迁移。OpenAI、Anthropic、Moonshot (Kimi)、MiniMax (MiMo) 等 AI-Native 组织依靠**极高人效、人机共生协作（Vibe Coding / Agentic Loops）与评测驱动探索（Eval-driven Development）**，打破了传统的层级式软件流水线。

`open-labor` 是一个开源结构化语料库与现代化 WebUI 工具，旨在：

1. **打破职级语义稀释**：剥离空洞黑话，沉淀真实环境下具有高度可操作性的心智模型与决策树。
2. **两套工程范式横向对照**：将"传统互联网大厂层级流水线"与"AI-Native 适应性蜂群（Adaptive Swarms）"并排呈现，观察研发哲学的跃迁。
3. **在职自我对齐与评估**：通过场景化判断锚点，帮助工程师与技术管理者识别认知盲区，跳出低维劳动陷阱。

---

## 🧭 核心双范式对照 (Two Paradigms)

| 核心维度 | 传统互联网大厂范式 (BAT / ByteDance) | AI-Native 组织范式 (Anthropic / OpenAI / Kimi / MiMo) |
| --- | --- | --- |
| **组织拓扑与人效** | 树状金字塔、流水线协同、强调跨部门协同机制与对齐成本 | 极小核心团队（Swarms）、扁平网络、单个 IC 的技术杠杆被放至极大 |
| **核心思考模型** | 确定性交付、SLA 保障、投入产出比 (ROI)、精细化业务指标 | 缩放定律 (Scaling Laws)、评估对齐 (Evals)、黑盒涌现的探索成本与试错效率 |
| **职级核心本质** | **组织协调杠杆**（P8/P9 靠管人、拿资源、做横向跨域闭环） | **认知探索与工程执行合一**（高阶研究员/工程师直接下场写底层 infra 或训练脚本） |
| **交付与代码逻辑** | 人写代码、人做 Code Review、规范驱动的工程流水线 | **Vibe Coding / 人机结对**、Agent 自动化流水线、Eval-driven Development (EDD) |
| **角色与边界** | 职能明确划分（前端、后端、测试、算法、产品） | **全栈研究员 / 产品工程师 (Product Engineer)**，一人打通从模型微调、Eval 到交互 |

---

## 🧩 语料建模架构 (Corpus Schema)

杜绝"形而上学的黑话套话"与"流水账任务清单"，语料库以结构化 YAML/MDX 形式收敛，严格遵循统一的 Schema 四维模型：

```typescript
export interface LaborCorpusEntry {
  id: string;
  meta: {
    organization: 'Alibaba' | 'ByteDance' | 'Tencent' | 'Baidu' | 'Anthropic' | 'OpenAI' | 'Kimi' | 'MiMo' | 'DeepSeek' | 'Zhipu';
    level_or_role: string;               // e.g., "P7", "P8", "MTS", "Research Lead"
    paradigm: 'hierarchical' | 'ai-native';
    domain: 'Infra' | 'Backend' | 'Product Engineer' | 'Research' | 'Architecture';
    version_tag?: string;                // e.g., "增量扩张期范式" vs "存量防御/降本增效期范式"
    source: {                            // 来源标注（合规原则）
      type: '公开材料归纳' | '亲历者投稿' | '社区共识';
      note?: string;                     // 来源线索
    };
  };
  mental_models: {
    primary_metrics: string[];           // 默认关注的一级指标
    underlying_assumptions: string[];    // 底层决策假设与第一性原理
  };
  scenarios: Array<{
    scenario_title: string;              // 场景（如技术债、模糊需求、评测分歧、紧急故障）
    junior_approach: string;             // 初阶解法（标准反应）
    senior_approach: string;             // 进阶解法（高阶解法）
    trade_offs: string;                  // 核心代价与权衡
  }>;
  workflow_and_toolchains: {
    collaboration_interfaces: string[];  // 与上下游/跨团队的信息交互与对齐协议
    agent_and_automation_leverage: string[]; // 实际采用的自动化杠杆与工具链
  };
  anti_patterns: string[];               // 伪高阶表现、典型认知盲区与陷阱
  self_assessment_checks: Array<{
    id: string;
    question: string;                    // 场景化情境判断题
    behavioral_anchor: string;           // 行为锚点描述
  }>;
}
```

---

## 🖥️ WebUI 核心功能（已实现）

* **双模知识矩阵 (Matrix View)**
* 支持在"传统层级标尺（P6–P10）"与"AI-Native 角色标尺（IC/MTS/Lead）"间无缝切换。
* 横纵轴按公司、层级、思维维度进行高信息密度聚合展示。

* **情境对比卡片 (Scenario Contrast Cards)**
* 针对同一工程矛盾（如技术重构推不动、业务紧急插单、黑盒模型效果抖动），横向对比初级 vs 高级、传统大厂流水线 vs AI-Native 敏捷排查的直观差异。

* **自评与对齐雷达 (Self-Assessment Drawer)**
* 摒弃虚泛的自我打分，采用客观情境判断题，输出传统大厂与 AI-Native 双坐标雷达映射；自动识别短板维度、给出成长建议与推荐切片，生成成长轨迹（数据本地存储、可导出/导入）。

* **社区填报与审核流 (Community Contribution)**
* 本地优先（Local-First）填写并支持一键导出标准 PR，配套脱敏与去黑话校验规范。

---

## 📂 项目结构

```text
open-labor/
├── content/                     # 结构化语料库 (MDX frontmatter)，按范式/组织分层
│   ├── hierarchical/            # 传统大厂
│   │   ├── alibaba/   bytedance/   tencent/   baidu/
│   │   └── p6·p7·p9、2-1·p8·3-1·3-2、t11、t7 等切片
│   └── ai-native/               # AI-Native（含混元/文心混合范式）
│       ├── anthropic/  openai/  kimi/  mimo/  deepseek/  zhipu/
│       └── tencent/(混元)  baidu/(文心) 等切片
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # 首页 = 矩阵视图
│   │   ├── matrix/ contrast/ corpus/ docs/[slug]/ slice/[id]/
│   │   ├── assess/              # 自评 + 成长建议 + 成长轨迹
│   │   └── contribute/          # 语料填报向导（导出 MDX）
│   ├── components/              # matrix-view / scenario-card / self-assessment / paradigm-switch / radar-chart …
│   ├── lib/                     # content.ts 加载 / schema.ts 视图模型 / assessment.ts 打分与建议
│   └── types/labor-corpus.ts    # 公共 Schema (zod 校验)
├── scripts/                     # validate-content.ts（语料校验）/ check-jargon.mjs（黑话检查）
├── docs/                        # contribution / redaction / tier-axis
└── .github/                     # CI 工作流 / PR 模板
```

---

## 📊 当前语料矩阵

20 篇切片 · 12 家组织 · 执行层到战略层（tier 4–9）· 7 类场景双范式对照。

| 标尺 | 传统层级 (hierarchical) | AI-Native |
| --- | --- | --- |
| 4 | 阿里 P6 | — |
| 5 | 字节 2-1 | MiMo 初级研究员 |
| 6 | 阿里 P7 / 百度 T7 | DeepSeek / Kimi / MiMo / 混元 / 智谱 |
| 7 | 阿里 P8 / 腾讯 T11 | Anthropic MTS / OpenAI MTS / 文心 Infra |
| 8 | 字节 3-2 总监 | Anthropic 研究经理 |
| 9 | 阿里 P9 / 字节 3-1 | OpenAI 研究负责人 |

> 每档标尺两侧范式都有样本，形成管理范式、战略范式、执行层成长三组贯穿对照。标尺换算口径见 [docs/tier-axis.md](docs/tier-axis.md)。

---

## 🛡️ 内容合规与贡献原则 (Guidelines)

为保证项目长期健康演进，所有贡献内容必须遵守以下规范：

1. **绝对脱敏原则**：严禁提交任何涉及具体业务非公开数据、内网专属系统名、未公开产品战略或代码段的内容。所有案例必须抽象提炼为通用的架构模式与组织博弈推演。
2. **拒绝空洞黑话**：任何概念必须附带至少一个具体的"场景冲突 + 决策权衡（Trade-offs）"。
3. **拥抱时代演进**：职级要求随周期变化，提交语料时请附带时间或业务周期标记（如：业务高增期 vs 降本增效期）。

---

## 🚀 快速启动 (Getting Started)

```bash
# 1. 克隆仓库
git clone https://github.com/open-labor/open-labor.git
cd open-labor

# 2. 安装依赖
pnpm install

# 3. 本地启动
pnpm dev
```

本地服务默认运行于 `http://localhost:3000`。可通过编辑 `content/` 下的文件实时预览语料渲染与矩阵变化。
