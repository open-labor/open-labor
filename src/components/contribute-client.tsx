"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Plus, Trash2 } from "lucide-react";
import { ORGANIZATIONS, DOMAINS, SCENARIO_CATEGORIES, ASSESSMENT_DIMENSIONS } from "@/types/labor-corpus";

const DRAFT_KEY = "open-labor-draft";

interface ScenarioDraft {
  scenario_title: string;
  junior_approach: string;
  senior_approach: string;
  trade_offs: string;
  category: string;
}

interface CheckDraft {
  question: string;
  behavioral_anchor: string;
  dimension: string;
}

interface Draft {
  id: string;
  organization: string;
  level_or_role: string;
  paradigm: "hierarchical" | "ai-native";
  domain: string;
  version_tag: string;
  tier_axis: string;
  title: string;
  summary: string;
  source_type: string;
  source_note: string;
  assumptions: string;
  metrics: string;
  boundary: string;
  scenarios: ScenarioDraft[];
  collaboration: string;
  leverage: string;
  antiPatterns: string;
  checks: CheckDraft[];
  narrative: string;
}

const EMPTY: Draft = {
  id: "",
  organization: "Alibaba",
  level_or_role: "",
  paradigm: "hierarchical",
  domain: "Backend",
  version_tag: "",
  tier_axis: "5",
  title: "",
  summary: "",
  source_type: "公开材料归纳",
  source_note: "",
  assumptions: "",
  metrics: "",
  boundary: "",
  scenarios: [{ scenario_title: "", junior_approach: "", senior_approach: "", trade_offs: "", category: "tech-debt" }],
  collaboration: "",
  leverage: "",
  antiPatterns: "",
  checks: [{ question: "", behavioral_anchor: "", dimension: "decision" }],
  narrative: "",
};

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
/** 名称 | 定义 | 伪信号 → metric 对象 */
function parseMetrics(s: string) {
  return lines(s).map((l) => {
    const [name, definition, anti_signal] = l.split("|").map((x) => x.trim());
    return anti_signal ? { name, definition, anti_signal } : definition ? { name, definition } : { name };
  });
}
function parseAntiPatterns(s: string) {
  return lines(s).map((l) => {
    const [name, manifestation, why_it_fails, correction] = l.split("|").map((x) => x.trim());
    return { name, manifestation, why_it_fails, correction };
  });
}

function buildEntry(d: Draft) {
  return {
    id: d.id,
    meta: {
      organization: d.organization,
      level_or_role: d.level_or_role,
      paradigm: d.paradigm,
      domain: d.domain,
      ...(d.version_tag ? { version_tag: d.version_tag } : {}),
      tier_axis: Number(d.tier_axis) || undefined,
      ...(d.title ? { title: d.title } : {}),
      ...(d.summary ? { summary: d.summary } : {}),
      source: {
        type: d.source_type,
        ...(d.source_note ? { note: d.source_note } : {}),
      },
    },
    mental_models: {
      primary_metrics: parseMetrics(d.metrics),
      underlying_assumptions: lines(d.assumptions),
      ...(lines(d.boundary).length ? { boundary_awareness: lines(d.boundary) } : {}),
    },
    scenarios: d.scenarios
      .filter((s) => s.scenario_title)
      .map((s) => ({
        scenario_title: s.scenario_title,
        junior_approach: s.junior_approach,
        senior_approach: s.senior_approach,
        trade_offs: s.trade_offs,
        ...(s.category ? { category: s.category } : {}),
      })),
    workflow_and_toolchains: {
      collaboration_interfaces: lines(d.collaboration),
      agent_and_automation_leverage: lines(d.leverage),
    },
    anti_patterns: parseAntiPatterns(d.antiPatterns),
    self_assessment_checks: d.checks
      .filter((c) => c.question)
      .map((c) => ({
        id: `sa-${c.dimension}-${Math.random().toString(36).slice(2, 6)}`,
        question: c.question,
        behavioral_anchor: c.behavioral_anchor,
        dimension: c.dimension,
      })),
  };
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-[var(--muted)]">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm outline-none focus:border-[var(--ai-native)]/60";

export function ContributeClient() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) setDraft(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function update(patch: Partial<Draft>) {
    setDraft((d) => {
      const next = { ...d, ...patch };
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const entry = buildEntry(draft);
  const mdx = `---\n${JSON.stringify(entry, null, 2)}\n---\n\n## 专家按语\n${draft.narrative || "（在此补充 2-3 段叙事：该范式的底层逻辑、与另一范式的分野）"}\n`;

  const missing: string[] = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.id)) missing.push("id（kebab-case）");
  if (!draft.level_or_role) missing.push("level_or_role");
  if (lines(draft.metrics).length === 0) missing.push("至少 1 条首要指标");
  if (lines(draft.assumptions).length === 0) missing.push("至少 1 条决策假设");
  if (!draft.scenarios.some((s) => s.scenario_title && s.trade_offs)) missing.push("至少 1 个完整场景（含权衡）");
  if (lines(draft.collaboration).length === 0) missing.push("协作协议");
  if (lines(draft.leverage).length === 0) missing.push("杠杆/工具链");
  if (!lines(draft.antiPatterns).some((l) => l.split("|").length >= 1 && l.trim())) missing.push("至少 1 条反模式");
  if (!draft.checks.some((c) => c.question && c.behavioral_anchor)) missing.push("至少 1 条自评检查");

  async function copy() {
    await navigator.clipboard.writeText(mdx);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([mdx], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.id || "new-slice"}.mdx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const STEPS = ["元信息", "心智模型", "场景", "工作流", "反模式与自评", "导出"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">语料填报向导</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          本地优先：草稿实时保存在浏览器 localStorage，随时导出标准 MDX 提交 PR。
          请确认内容已绝对脱敏（见 docs/redaction.md）。
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              step === i
                ? "border-[var(--ai-native)]/60 bg-[var(--ai-native)]/10"
                : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 md:grid-cols-2">
          <Field label="id（kebab-case，= 文件名）">
            <input className={inputCls} value={draft.id} onChange={(e) => update({ id: e.target.value })} placeholder="bytedance-p7-backend" />
          </Field>
          <Field label="organization">
            <select className={inputCls} value={draft.organization} onChange={(e) => update({ organization: e.target.value })}>
              {ORGANIZATIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="level_or_role（如 P7 / MTS / Research Lead）">
            <input className={inputCls} value={draft.level_or_role} onChange={(e) => update({ level_or_role: e.target.value })} />
          </Field>
          <Field label="paradigm">
            <select className={inputCls} value={draft.paradigm} onChange={(e) => update({ paradigm: e.target.value as Draft["paradigm"] })}>
              <option value="hierarchical">hierarchical</option>
              <option value="ai-native">ai-native</option>
            </select>
          </Field>
          <Field label="domain">
            <select className={inputCls} value={draft.domain} onChange={(e) => update({ domain: e.target.value })}>
              {DOMAINS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="version_tag（业务周期标记）" hint="如：增量扩张期范式 / 存量防御降本增效期范式">
            <input className={inputCls} value={draft.version_tag} onChange={(e) => update({ version_tag: e.target.value })} />
          </Field>
          <Field label="source.type（来源标注）">
            <select className={inputCls} value={draft.source_type} onChange={(e) => update({ source_type: e.target.value })}>
              <option>公开材料归纳</option>
              <option>亲历者投稿</option>
              <option>社区共识</option>
            </select>
          </Field>
          <Field label="source.note（来源线索，可选）" hint="如：基于公开工程分享/访谈/技术报告归纳">
            <input className={inputCls} value={draft.source_note} onChange={(e) => update({ source_note: e.target.value })} />
          </Field>
          <Field label="tier_axis（1-10 级别标尺）">
            <input type="number" min={1} max={10} className={inputCls} value={draft.tier_axis} onChange={(e) => update({ tier_axis: e.target.value })} />
          </Field>
          <Field label="title（可选）">
            <input className={inputCls} value={draft.title} onChange={(e) => update({ title: e.target.value })} />
          </Field>
          <Field label="summary（可选）">
            <textarea rows={2} className={inputCls} value={draft.summary} onChange={(e) => update({ summary: e.target.value })} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <Field label="underlying_assumptions（每行一条决策假设）">
            <textarea rows={5} className={inputCls} value={draft.assumptions} onChange={(e) => update({ assumptions: e.target.value })} />
          </Field>
          <Field label="primary_metrics（每行：名称 | 定义 | 伪信号）" hint="伪信号可选，如：平均 RT | 长尾被平均掩盖 |">
            <textarea rows={4} className={inputCls} value={draft.metrics} onChange={(e) => update({ metrics: e.target.value })} />
          </Field>
          <Field label="boundary_awareness（可选，每行一条）">
            <textarea rows={3} className={inputCls} value={draft.boundary} onChange={(e) => update({ boundary: e.target.value })} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {draft.scenarios.map((sc, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">场景 {i + 1}</span>
                {draft.scenarios.length > 1 && (
                  <button
                    onClick={() => update({ scenarios: draft.scenarios.filter((_, j) => j !== i) })}
                    className="rounded p-1 text-[var(--muted)] hover:text-red-300"
                    aria-label="删除"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <Field label="scenario_title（冲突现场，须含时间/资源/干系人约束）">
                <textarea rows={2} className={inputCls} value={sc.scenario_title} onChange={(e) => update({ scenarios: draft.scenarios.map((x, j) => j === i ? { ...x, scenario_title: e.target.value } : x) })} />
              </Field>
              <Field label="junior_approach（初阶解法）">
                <textarea rows={2} className={inputCls} value={sc.junior_approach} onChange={(e) => update({ scenarios: draft.scenarios.map((x, j) => j === i ? { ...x, junior_approach: e.target.value } : x) })} />
              </Field>
              <Field label="senior_approach（高阶解法）">
                <textarea rows={3} className={inputCls} value={sc.senior_approach} onChange={(e) => update({ scenarios: draft.scenarios.map((x, j) => j === i ? { ...x, senior_approach: e.target.value } : x) })} />
              </Field>
              <Field label="trade_offs（核心代价与权衡，禁止为空）">
                <textarea rows={2} className={inputCls} value={sc.trade_offs} onChange={(e) => update({ scenarios: draft.scenarios.map((x, j) => j === i ? { ...x, trade_offs: e.target.value } : x) })} />
              </Field>
              <Field label="category（可选）">
                <select className={inputCls} value={sc.category} onChange={(e) => update({ scenarios: draft.scenarios.map((x, j) => j === i ? { ...x, category: e.target.value } : x) })}>
                  <option value="">不指定</option>
                  {SCENARIO_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          ))}
          <button
            onClick={() => update({ scenarios: [...draft.scenarios, { scenario_title: "", junior_approach: "", senior_approach: "", trade_offs: "", category: "tech-debt" }] })}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
          >
            <Plus className="size-4" /> 添加场景
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <Field label="collaboration_interfaces（每行一条协作协议）">
            <textarea rows={4} className={inputCls} value={draft.collaboration} onChange={(e) => update({ collaboration: e.target.value })} />
          </Field>
          <Field label="agent_and_automation_leverage（每行一条杠杆）">
            <textarea rows={4} className={inputCls} value={draft.leverage} onChange={(e) => update({ leverage: e.target.value })} />
          </Field>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <Field label="anti_patterns（每行：名称 | 表现 | 为何失败 | 纠偏）">
              <textarea rows={4} className={inputCls} value={draft.antiPatterns} onChange={(e) => update({ antiPatterns: e.target.value })} />
            </Field>
          </div>
          <div className="space-y-4">
            {draft.checks.map((c, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">自评检查 {i + 1}</span>
                  {draft.checks.length > 1 && (
                    <button onClick={() => update({ checks: draft.checks.filter((_, j) => j !== i) })} className="rounded p-1 text-[var(--muted)] hover:text-red-300" aria-label="删除">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <Field label="question（情境判断题）">
                  <textarea rows={2} className={inputCls} value={c.question} onChange={(e) => update({ checks: draft.checks.map((x, j) => j === i ? { ...x, question: e.target.value } : x) })} />
                </Field>
                <Field label="behavioral_anchor（达标行为锚点）">
                  <textarea rows={2} className={inputCls} value={c.behavioral_anchor} onChange={(e) => update({ checks: draft.checks.map((x, j) => j === i ? { ...x, behavioral_anchor: e.target.value } : x) })} />
                </Field>
                <Field label="dimension">
                  <select className={inputCls} value={c.dimension} onChange={(e) => update({ checks: draft.checks.map((x, j) => j === i ? { ...x, dimension: e.target.value } : x) })}>
                    {ASSESSMENT_DIMENSIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
            ))}
            <button
              onClick={() => update({ checks: [...draft.checks, { question: "", behavioral_anchor: "", dimension: "decision" }] })}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
            >
              <Plus className="size-4" /> 添加自评检查
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          {missing.length > 0 ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
              还缺：{missing.join("、")}。导出前请补齐（最终以 CI 的 zod 校验为准）。
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              结构完整。请再做最终脱敏自查，然后导出文件提交 PR 到 content/{draft.paradigm === "hierarchical" ? "hierarchical" : "ai-native"}/。
            </div>
          )}
          <Field label="专家按语（markdown 正文）">
            <textarea rows={4} className={inputCls} value={draft.narrative} onChange={(e) => update({ narrative: e.target.value })} />
          </Field>
          <div className="flex gap-2">
            <button onClick={copy} className="flex items-center gap-1.5 rounded-lg bg-[var(--ai-native)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              <Copy className="size-4" /> {copied ? "已复制" : "复制 MDX"}
            </button>
            <button onClick={download} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--panel-2)]">
              <Download className="size-4" /> 下载 {draft.id || "new-slice"}.mdx
            </button>
            <button
              onClick={() => { setDraft(EMPTY); window.localStorage.removeItem(DRAFT_KEY); }}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
            >
              清空草稿
            </button>
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-xs leading-relaxed">
            {mdx}
          </pre>
        </div>
      )}
    </div>
  );
}
