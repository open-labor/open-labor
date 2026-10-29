<!-- Diátaxis: How-to -->
# 贡献指南

感谢为 open-labor 沉淀范式语料。提交前请完整阅读本文件与 [redaction.md](./redaction.md)（脱敏指引）。

## 提交流程

1. Fork → 分支 → 在 `content/hierarchical/` 或 `content/ai-native/` 新增 `<org>-<level>-<domain>.mdx`（文件名 = `id`）。
   - 推荐先走 WebUI 的 `/contribute` 填报向导：本地优先填写，一键导出标准 MDX。
2. 在 PR 描述中声明信息来源类型：**公开材料归纳 / 亲历者投稿 / 社区共识**。
3. 本地验证：`pnpm validate:content`（秒级 zod 校验，无需完整构建）+ `pnpm check:jargon`；提交前建议再跑 `pnpm build` 全量验证。
4. CI 通过 + 至少一位维护者评审后合并。

## Schema 硬性要求

- 结构见 `src/types/labor-corpus.ts`（与 README 的 `LaborCorpusEntry` 一致）；必填最小集之外的字段均为可选扩展。
- `self_assessment_checks` 强烈建议覆盖 5 个 dimension（decision / boundary / leverage / loop / antipattern）各至少 1 条，雷达画像才完整。
- `meta.tier_axis`（1-10）用于跨范式矩阵对齐：P5≈3、P6≈4.5、P7≈6、P8≈7.5、P9≈9；AI-Native 按职责带宽换算（资深 IC ≈ 6-7）。
- `meta.version_tag` 必填度高：请标注业务周期（增量扩张期 / 存量防御降本增效期等），呼应"拥抱时代演进"原则。

## 质量红线

1. **拒绝空洞黑话**：每个概念必须附带具体的「场景冲突 + 决策权衡」；`trade_offs` 为空 = 拒绝。CI 会扫描常见黑话词表。
2. **场景必须带约束**：`scenario_title` 必须含时间/资源/干系人约束中的至少两类，否则不构成决策问题。
3. **行为锚点可观察**：锚点描述可被第三方观察到的行为，不写"具备 XX 思维"。
4. **高阶解法可操作**：`senior_approach` / `senior_steps` 必须是可执行动作，拒绝"加强沟通、提升认知"式空话。
