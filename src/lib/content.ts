import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  laborCorpusSchema,
  type LaborCorpusEntry,
  type MetricDetail,
  type AntiPatternDetail,
} from "@/types/labor-corpus";
import {
  ORG_ZH,
  DOMAIN_ZH,
  SCENARIO_CATEGORY_LABELS,
  type SliceVM,
  type Metric,
  type AntiPatternVM,
  type ScenarioVM,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const SUBDIRS = ["hierarchical", "ai-native"] as const;

function normalizeMetric(m: string | MetricDetail): Metric {
  return typeof m === "string"
    ? { name: m }
    : { name: m.name, definition: m.definition, antiSignal: m.anti_signal };
}

function normalizeAntiPattern(a: string | AntiPatternDetail): AntiPatternVM {
  return typeof a === "string"
    ? { name: a }
    : {
        name: a.name,
        manifestation: a.manifestation,
        whyItFails: a.why_it_fails,
        correction: a.correction,
      };
}

function normalize(entry: LaborCorpusEntry, narrative?: string): SliceVM {
  const orgZh = ORG_ZH[entry.meta.organization] ?? entry.meta.organization;
  const domainZh = DOMAIN_ZH[entry.meta.domain] ?? entry.meta.domain;
  return {
    id: entry.id,
    organization: entry.meta.organization,
    organizationZh: orgZh,
    levelOrRole: entry.meta.level_or_role,
    tierAxis: entry.meta.tier_axis ?? 5,
    paradigm: entry.meta.paradigm,
    domain: entry.meta.domain,
    domainZh,
    versionTag: entry.meta.version_tag,
    source: entry.meta.source,
    title:
      entry.meta.title ?? `${orgZh} ${entry.meta.level_or_role} · ${domainZh}范式`,
    summary: entry.meta.summary ?? "",
    tags: entry.meta.tags ?? [],
    mentalModels: {
      assumptions: entry.mental_models.underlying_assumptions,
      metrics: entry.mental_models.primary_metrics.map(normalizeMetric),
      boundary: entry.mental_models.boundary_awareness ?? [],
    },
    scenarios: entry.scenarios.map(
      (sc, i): ScenarioVM => ({
        id: sc.id ?? `${entry.id}-s${i + 1}`,
        title: sc.scenario_title,
        category: sc.category,
        junior: sc.junior_approach,
        senior: sc.senior_approach,
        steps: sc.senior_steps,
        tradeOffs: sc.trade_offs,
        tradeOffDetails: sc.trade_off_details,
      })
    ),
    workflow: {
      collaboration: entry.workflow_and_toolchains.collaboration_interfaces,
      leverage: entry.workflow_and_toolchains.agent_and_automation_leverage,
      loop: entry.workflow_and_toolchains.delivery_loop,
    },
    antiPatterns: entry.anti_patterns.map(normalizeAntiPattern),
    checks: entry.self_assessment_checks.map((c) => ({
      id: c.id,
      question: c.question,
      anchor: c.behavioral_anchor,
      dimension: c.dimension ?? "decision",
      weight: c.weight ?? 0.2,
      anchors: c.anchors,
    })),
    narrative: narrative?.trim() || undefined,
  };
}

let cache: SliceVM[] | null = null;

/** 递归收集目录下所有 .mdx（支持 content/{paradigm}/{org}/ 两级结构） */
function walkMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walkMdx(full) : e.name.endsWith(".mdx") ? [full] : [];
  });
}

/** 服务端加载 content/{hierarchical,ai-native}/*.mdx，zod 校验失败直接抛错（fail build） */
export function loadSlices(): SliceVM[] {
  // 生产环境缓存；开发模式每次重读，支持编辑语料实时预览
  if (cache && process.env.NODE_ENV === "production") return cache;
  const slices: SliceVM[] = [];
  for (const sub of SUBDIRS) {
    const dir = path.join(CONTENT_DIR, sub);
    for (const full of walkMdx(dir)) {
      const rel = path.relative(CONTENT_DIR, full);
      const { data, content } = matter(fs.readFileSync(full, "utf8"));
      const parsed = laborCorpusSchema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        throw new Error(`语料校验失败 ${rel} → ${issues}`);
      }
      const entry = parsed.data;
      if (entry.id !== path.basename(full, ".mdx")) {
        throw new Error(`语料校验失败 ${rel} → id「${entry.id}」与文件名不一致`);
      }
      slices.push(normalize(entry, content));
    }
  }
  if (slices.length === 0) throw new Error("content/ 下没有任何语料切片");
  cache = slices.sort(
    (a, b) =>
      a.paradigm.localeCompare(b.paradigm) || a.tierAxis - b.tierAxis
  );
  return cache;
}

export function getSlice(id: string): SliceVM | undefined {
  return loadSlices().find((s) => s.id === id);
}

export function slicesByParadigm(paradigm: SliceVM["paradigm"]) {
  return loadSlices()
    .filter((s) => s.paradigm === paradigm)
    .sort((a, b) => a.tierAxis - b.tierAxis);
}

export interface ContrastItem {
  sliceId: string;
  org: string;
  paradigm: string;
  levelOrRole: string;
  scenario: ScenarioVM;
}

export interface ContrastGroup {
  key: string;
  label: string;
  items: ContrastItem[];
}

/** 跨切片按场景类别索引：同一业务矛盾在不同范式下的解法对照 */
export function scenariosByCategory(): ContrastGroup[] {
  const map = new Map<string, ContrastItem[]>();
  for (const s of loadSlices()) {
    for (const sc of s.scenarios) {
      if (!sc.category) continue;
      const list = map.get(sc.category) ?? [];
      list.push({
        sliceId: s.id,
        org: s.organizationZh,
        paradigm: s.paradigm,
        levelOrRole: s.levelOrRole,
        scenario: sc,
      });
      map.set(sc.category, list);
    }
  }
  return Object.entries(SCENARIO_CATEGORY_LABELS).flatMap(([key, label]) =>
    map.has(key) ? [{ key, label, items: map.get(key)! }] : []
  );
}
