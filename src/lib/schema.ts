/**
 * WebUI 视图层模型：由 src/lib/content.ts 将 LaborCorpusEntry 归一化而来。
 * 组件只消费这里的数据结构，不直接接触原始语料。
 */
import type {
  ASSESSMENT_DIMENSIONS,
  SCENARIO_CATEGORIES,
} from "@/types/labor-corpus";

export type Paradigm = "hierarchical" | "ai-native";
export type AssessmentDimension = (typeof ASSESSMENT_DIMENSIONS)[number];
export type ScenarioCategory = (typeof SCENARIO_CATEGORIES)[number];

export interface Metric {
  name: string;
  definition?: string;
  antiSignal?: string;
}

export interface PlaybookStep {
  move: string;
  rationale: string;
}

export interface TradeOff {
  choose: string;
  over: string;
  cost: string;
}

export interface ScenarioVM {
  id: string;
  title: string;
  category?: ScenarioCategory;
  junior: string;
  senior: string;
  steps?: PlaybookStep[];
  tradeOffs: string;
  tradeOffDetails?: TradeOff[];
}

export interface DeliveryLoop {
  trigger: string;
  loop: string[];
  cadence: string;
  evidence: string;
}

export interface AntiPatternVM {
  name: string;
  manifestation?: string;
  whyItFails?: string;
  correction?: string;
}

export interface BehavioralAnchor {
  score: 1 | 2 | 3 | 4 | 5;
  behavior: string;
}

export interface CheckVM {
  id: string;
  question: string;
  anchor: string;
  dimension: AssessmentDimension;
  weight: number;
  anchors?: BehavioralAnchor[];
}

export interface SliceVM {
  id: string;
  organization: string;
  organizationZh: string;
  levelOrRole: string;
  tierAxis: number;
  paradigm: Paradigm;
  domain: string;
  domainZh: string;
  versionTag?: string;
  source: {
    type: "公开材料归纳" | "亲历者投稿" | "社区共识";
    note?: string;
  };
  title: string;
  summary: string;
  tags: string[];
  mentalModels: {
    assumptions: string[];
    metrics: Metric[];
    boundary: string[];
  };
  scenarios: ScenarioVM[];
  workflow: {
    collaboration: string[];
    leverage: string[];
    loop?: DeliveryLoop;
  };
  antiPatterns: AntiPatternVM[];
  checks: CheckVM[];
  /** MDX 正文：专家按语（markdown） */
  narrative?: string;
}

export const ASSESSMENT_DIMENSION_LABELS: Record<AssessmentDimension, string> = {
  decision: "决策推演",
  boundary: "边界协同",
  leverage: "杠杆使用",
  loop: "闭环纪律",
  antipattern: "反模式免疫",
};

export const DIMENSION_ADVICE: Record<
  AssessmentDimension,
  { advice: string; recommended: string[] }
> = {
  decision: {
    advice:
      "把『凭感觉』升级为『给代价表』：面对冲突先量化风险与各选项代价，让决策在信息完整下发生，并设纠错空间。",
    recommended: ["alibaba-p7-backend", "openai-research-lead"],
  },
  boundary: {
    advice:
      "把边界契约化：说清自己的责任田与越界机制，跨域用接口契约与书面异议替代人情拉锯。",
    recommended: ["tencent-t11-architecture", "anthropic-research-manager"],
  },
  leverage: {
    advice:
      "把自己从重复里解放：识别重复动作并自动化或复用，把个人产出放大为团队资产。",
    recommended: ["anthropic-mts-eval", "mimo-core-research"],
  },
  loop: {
    advice:
      "坚持改动必验证：上线前定验收口径、上线后同口径复盘，结论含反例维度。",
    recommended: ["bytedance-p8-infra", "baidu-t7-backend"],
  },
  antipattern: {
    advice:
      "识别伪高阶：警惕技术高尚化、唯指标、过早工程化，用可观察的行为而非姿态自评。",
    recommended: ["bytedance-3-2-director", "kimi-product-engineer"],
  },
};

export const SCENARIO_CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  "tech-debt": "技术债",
  "ambiguous-requirements": "模糊需求",
  "uncertainty-exploration": "不确定性探索",
  "eval-disagreement": "评测分歧",
  "cross-team-conflict": "跨团队冲突",
  "resource-contention": "资源争夺",
  incident: "故障应急",
};

export const SCENARIO_CATEGORIES_VIEW = (
  Object.keys(SCENARIO_CATEGORY_LABELS) as ScenarioCategory[]
).map((key) => ({ key, label: SCENARIO_CATEGORY_LABELS[key] }));

export const ASSESSMENT_DIMENSIONS_VIEW = (
  Object.keys(ASSESSMENT_DIMENSION_LABELS) as AssessmentDimension[]
).map((key) => ({ key, label: ASSESSMENT_DIMENSION_LABELS[key] }));

export const ORG_ZH: Record<string, string> = {
  Alibaba: "阿里巴巴",
  ByteDance: "字节跳动",
  Tencent: "腾讯",
  Baidu: "百度",
  Anthropic: "Anthropic",
  OpenAI: "OpenAI",
  Kimi: "月之暗面 Kimi",
  MiMo: "MiniMax MiMo",
  DeepSeek: "DeepSeek 深度求索",
  Zhipu: "智谱 AI",
};

export const DOMAIN_ZH: Record<string, string> = {
  Infra: "基础架构",
  Backend: "后端工程",
  "Product Engineer": "产品工程",
  Research: "研究",
  Architecture: "架构",
};

export const PARADIGM_LABEL: Record<Paradigm, string> = {
  hierarchical: "传统层级体系",
  "ai-native": "AI-Native 体系",
};

export function accentOf(p: Paradigm): string {
  return p === "hierarchical" ? "var(--hierarchical)" : "var(--ai-native)";
}

export function scenarioLabel(category?: ScenarioCategory): string {
  return category ? SCENARIO_CATEGORY_LABELS[category] : "通用场景";
}
