import { z } from "zod";

/**
 * open-labor 语料公共契约（贡献者视角，与 README Schema 一致）
 * 设计原则：必填字段 = 贡献最小集（低门槛）；WebUI 增强字段全部为可选扩展。
 * 所有扩展字段以注释标出，Community 填报向导只产出必填集 + 可选扩展。
 */

export const ORGANIZATIONS = [
  "Alibaba",
  "ByteDance",
  "Tencent",
  "Baidu",
  "Anthropic",
  "OpenAI",
  "Kimi",
  "MiMo",
  "DeepSeek",
  "Zhipu",
] as const;

export const DOMAINS = [
  "Infra",
  "Backend",
  "Product Engineer",
  "Research",
  "Architecture",
] as const;

export const SCENARIO_CATEGORIES = [
  "tech-debt",
  "ambiguous-requirements",
  "uncertainty-exploration",
  "eval-disagreement",
  "cross-team-conflict",
  "resource-contention",
  "incident",
] as const;

export const ASSESSMENT_DIMENSIONS = [
  "decision",
  "boundary",
  "leverage",
  "loop",
  "antipattern",
] as const;

const metricDetail = z.object({
  name: z.string().min(1),
  definition: z.string().optional(),
  /** 扩展：伪信号警示 */
  anti_signal: z.string().optional(),
});

const antiPatternDetail = z.object({
  name: z.string().min(1),
  manifestation: z.string().optional(),
  why_it_fails: z.string().optional(),
  correction: z.string().optional(),
});

const playbookStep = z.object({
  move: z.string().min(1),
  rationale: z.string().min(1),
});

export const laborCorpusSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id 必须为 kebab-case，且与文件名一致"),
  meta: z.object({
    organization: z.enum(ORGANIZATIONS),
    level_or_role: z.string().min(1),
    paradigm: z.enum(["hierarchical", "ai-native"]),
    domain: z.enum(DOMAINS),
    /** 拥抱时代演进：业务周期标记，如 "增量扩张期范式" / "存量防御/降本增效期范式" */
    version_tag: z.string().optional(),
    // ---- WebUI 扩展 ----
    /** 级别标尺 1-10，跨范式矩阵纵轴对齐用 */
    tier_axis: z.number().int().min(1).max(10).optional(),
    title: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    /** 来源标注（README 合规原则）：区分公开材料归纳 / 亲历者投稿 / 社区共识 */
    source: z.object({
      type: z.enum(["公开材料归纳", "亲历者投稿", "社区共识"]),
      note: z.string().optional(),
    }),
  }),
  mental_models: z.object({
    /** 允许纯字符串，或带定义与伪信号的扩展对象 */
    primary_metrics: z.array(z.union([z.string(), metricDetail])).min(1),
    underlying_assumptions: z.array(z.string()).min(1),
    /** 扩展：边界认知（管什么 / 不管什么 / 越界机制） */
    boundary_awareness: z.array(z.string()).optional(),
  }),
  scenarios: z
    .array(
      z.object({
        /** 场景冲突叙事：必须包含时间/资源/干系人约束中的至少两类 */
        scenario_title: z.string().min(1),
        junior_approach: z.string().min(1),
        senior_approach: z.string().min(1),
        /** 核心代价与权衡，禁止为空 */
        trade_offs: z.string().min(1),
        // ---- WebUI 扩展 ----
        id: z.string().optional(),
        category: z.enum(SCENARIO_CATEGORIES).optional(),
        /** 高阶打法的分步展开（move + rationale） */
        senior_steps: z.array(playbookStep).optional(),
        /** 结构化权衡：选 X 而非 Y，代价 Z */
        trade_off_details: z
          .array(
            z.object({
              choose: z.string().min(1),
              over: z.string().min(1),
              cost: z.string().min(1),
            })
          )
          .optional(),
      })
    )
    .min(1),
  workflow_and_toolchains: z.object({
    collaboration_interfaces: z.array(z.string()).min(1),
    agent_and_automation_leverage: z.array(z.string()).min(1),
    /** 扩展：交付闭环 */
    delivery_loop: z
      .object({
        trigger: z.string().min(1),
        loop: z.array(z.string()).min(2),
        cadence: z.string().min(1),
        evidence: z.string().min(1),
      })
      .optional(),
  }),
  anti_patterns: z.array(z.union([z.string(), antiPatternDetail])).min(1),
  self_assessment_checks: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().min(1),
        behavioral_anchor: z.string().min(1),
        // ---- WebUI 扩展 ----
        /** 雷达五维归类，缺省归入 decision */
        dimension: z.enum(ASSESSMENT_DIMENSIONS).optional(),
        weight: z.number().min(0).max(1).optional(),
        /** 1-5 分行为锚点阶梯；缺省时 UI 以 behavioral_anchor 作为达标参考 */
        anchors: z
          .array(
            z.object({
              score: z.union([
                z.literal(1),
                z.literal(2),
                z.literal(3),
                z.literal(4),
                z.literal(5),
              ]),
              behavior: z.string().min(1),
            })
          )
          .optional(),
      })
    )
    .min(1),
});

export type LaborCorpusEntry = z.infer<typeof laborCorpusSchema>;
export type MetricDetail = z.infer<typeof metricDetail>;
export type AntiPatternDetail = z.infer<typeof antiPatternDetail>;
export type PlaybookStep = z.infer<typeof playbookStep>;
