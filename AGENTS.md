<!-- Diátaxis: How-to -->
# AGENTS.md — open-labor 智能体维护指南

面向维护本仓库的 AI agent。改动先改 Schema，再改语料；每次改动跑校验。

## 核心规则

- `src/types/labor-corpus.ts` 是语料结构的唯一事实源。改结构先改 zod Schema，再迁移语料。
- 语料路径 `content/{paradigm}/{org}/{id}.mdx`，`id` 必须等于文件名（basename），加载按递归扫描。
- 每篇必须覆盖 `self_assessment_checks` 五维（decision/boundary/leverage/loop/antipattern）各 ≥1。
- 场景必须含约束（时间/资源/干系人至少两类）+ 非空 `trade_offs`；行为锚点必须可被第三方观察。
- 来源标注 `meta.source` 必填，区分公开材料归纳 / 亲历者投稿 / 社区共识。

## 命令

- `pnpm dev` / `pnpm build` — 开发 / 构建
- `pnpm validate:content` — zod + 五维覆盖校验（秒级，改动后必跑）
- `pnpm check:jargon` — 黑话词表扫描

## 禁止

- 脱敏违规：不提交内部系统名、非公开数据、未公开战略（见 [redaction](docs/redaction.md)）
- 空洞黑话：概念必须附「场景冲突 + 决策权衡」，禁用词表见 CI（见 [contribution](docs/contribution.md)）
- 空泛锚点：禁「在 X 的基础上」递进套话、禁「固化为机制/标准」类万能第 5 分
