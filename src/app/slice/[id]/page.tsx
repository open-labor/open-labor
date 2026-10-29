import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GitCompareArrows,
  Compass,
  Workflow,
  ShieldAlert,
  Gauge,
  Quote,
} from "lucide-react";
import Markdown from "react-markdown";
import { getSlice, loadSlices } from "@/lib/content";
import {
  PARADIGM_LABEL,
  accentOf,
  scenarioLabel,
} from "@/lib/schema";
import { AssessmentLauncher } from "@/components/assessment-launcher";

export function generateStaticParams() {
  return loadSlices().map((s) => ({ id: s.id }));
}

export default async function SlicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slice = getSlice(id);
  if (!slice) notFound();

  const accent = accentOf(slice.paradigm);
  const { mentalModels: mm, workflow } = slice;

  const all = loadSlices();
  const myCats = new Set(slice.scenarios.map((s) => s.category).filter(Boolean));
  const crossParadigm = all.filter(
    (s) =>
      s.paradigm !== slice.paradigm &&
      s.scenarios.some((sc) => sc.category && myCats.has(sc.category))
  );
  const neighbors = all
    .filter((s) => s.paradigm === slice.paradigm && s.id !== slice.id)
    .sort(
      (a, b) =>
        Math.abs(a.tierAxis - slice.tierAxis) - Math.abs(b.tierAxis - slice.tierAxis)
    )
    .slice(0, 2);

  return (
    <div className="space-y-8">
      <Link href="/matrix" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)]">
        <ArrowLeft className="size-4" /> 返回矩阵
      </Link>

      <header className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: accent }}>
              <span className="rounded px-1.5 py-0.5 font-medium" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)` }}>
                {PARADIGM_LABEL[slice.paradigm]}
              </span>
              <span className="text-[var(--muted)]">
                {slice.organization} · {slice.levelOrRole} · {slice.domainZh}
              </span>
              {slice.versionTag && (
                <span className="rounded bg-[var(--panel-2)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                  {slice.versionTag}
                </span>
              )}
              <span
                className="rounded bg-[var(--panel-2)] px-1.5 py-0.5 text-xs text-[var(--muted)]"
                title={slice.source.note}
              >
                来源：{slice.source.type}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{slice.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">{slice.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {slice.tags.map((t) => (
                <span key={t} className="rounded-md bg-[var(--panel-2)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <AssessmentLauncher slice={slice} />
            <Link
              href="/contrast"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
            >
              <GitCompareArrows className="size-4" /> 场景对照
            </Link>
          </div>
        </div>
      </header>

      {(crossParadigm.length > 0 || neighbors.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          {crossParadigm.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <GitCompareArrows className="size-4" style={{ color: accent }} />
                建议对照 · 同一矛盾，另一范式
              </h2>
              <div className="mt-3 space-y-2">
                {crossParadigm.map((s) => (
                  <Link
                    key={s.id}
                    href={`/slice/${s.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--panel-2)]"
                  >
                    <span className="shrink-0">
                      {s.organizationZh} · {s.levelOrRole}
                    </span>
                    <span className="truncate text-xs text-[var(--muted)]">
                      共享场景：
                      {[...new Set(s.scenarios.filter((sc) => sc.category && myCats.has(sc.category)).map((sc) => scenarioLabel(sc.category)))].join(" / ")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {neighbors.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <h2 className="text-sm font-semibold">同范式相邻标尺</h2>
              <div className="mt-3 space-y-2">
                {neighbors.map((s) => (
                  <Link
                    key={s.id}
                    href={`/slice/${s.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--panel-2)]"
                  >
                    <span className="shrink-0">
                      {s.organizationZh} · {s.levelOrRole}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      标尺 {s.tierAxis}（差 {Math.abs(s.tierAxis - slice.tierAxis).toFixed(1)}）
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {slice.narrative && (
        <section className="rounded-xl border border-[var(--ai-native)]/25 bg-[var(--panel)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
            <Quote className="size-4" style={{ color: accent }} /> 专家按语
          </h2>
          <div className="prose-invert mt-2 max-w-none text-sm leading-relaxed text-[var(--text)]/90 [&_strong]:text-[var(--text)]">
            <Markdown>{slice.narrative}</Markdown>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold"><Compass className="size-4" style={{ color: accent }} /> 决策假设</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text)]/90">
            {mm.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
          {mm.boundary.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold text-[var(--muted)]">边界认知</h3>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text)]/90">
                {mm.boundary.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </>
          )}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Gauge className="size-4" style={{ color: accent }} /> 首要指标</h2>
          <div className="mt-3 space-y-3">
            {mm.metrics.map((m, i) => (
              <div key={i}>
                <div className="text-sm font-medium">{m.name}</div>
                {m.definition && (
                  <div className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{m.definition}</div>
                )}
                {m.antiSignal && (
                  <div className="mt-1 rounded border border-red-500/25 bg-red-500/5 px-2 py-1 text-xs text-red-300">
                    伪信号：{m.antiSignal}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">场景化决策树</h2>
        {slice.scenarios.map((sc) => (
          <details key={sc.id} className="group rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 open:bg-[var(--panel-2)]">
            <summary className="cursor-pointer list-none">
              <span className="mr-2 rounded bg-[var(--panel-2)] px-1.5 py-0.5 text-xs text-[var(--muted)]">
                {scenarioLabel(sc.category)}
              </span>
              <span className="text-sm font-medium group-open:font-semibold">{sc.title}</span>
            </summary>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3 text-[13px] leading-relaxed">
                <div className="mb-1 text-xs font-medium text-red-300">初阶解法</div>
                {sc.junior}
              </div>
              <div>
                {sc.steps ? (
                  <ol className="space-y-2.5">
                    {sc.steps.map((step, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: accent }}>
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-[13px] leading-relaxed">{step.move}</div>
                          <div className="mt-1 text-xs leading-relaxed text-[var(--muted)]">依据：{step.rationale}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-[13px] leading-relaxed">{sc.senior}</p>
                )}
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {(sc.tradeOffDetails ?? [{ choose: sc.tradeOffs.split("，而非")[0].replace(/^选择/, ""), over: "", cost: sc.tradeOffs }]).map((t, i) =>
                t.over ? (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-2.5 text-xs leading-relaxed">
                    <span className="font-medium text-emerald-300">选「{t.choose}」</span>
                    <span className="text-[var(--muted)]"> 而非「{t.over}」</span>
                    <div className="mt-1 text-[var(--muted)]">代价：{t.cost}</div>
                  </div>
                ) : (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-2.5 text-xs leading-relaxed">
                    <span className="font-medium text-emerald-300">权衡：</span>
                    {t.cost}
                  </div>
                )
              )}
            </div>
          </details>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Workflow className="size-4" style={{ color: accent }} /> 工作流与工具链</h2>
          <h3 className="mt-3 text-sm font-semibold text-[var(--muted)]">协作协议</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--text)]/90">
            {workflow.collaboration.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          <h3 className="mt-4 text-sm font-semibold text-[var(--muted)]">杠杆（自动化 / Agent）</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--text)]/90">
            {workflow.leverage.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          {workflow.loop && (
            <>
              <h3 className="mt-4 text-sm font-semibold text-[var(--muted)]">交付闭环（{workflow.loop.cadence}）</h3>
              <ol className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                {workflow.loop.loop.map((step, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="rounded-md bg-[var(--panel-2)] px-2 py-1">{step}</span>
                    {i < workflow.loop!.loop.length - 1 && <span className="text-[var(--muted)]">→</span>}
                  </li>
                ))}
              </ol>
              <div className="mt-2 text-xs text-[var(--muted)]">
                触发：{workflow.loop.trigger} · 证据物：{workflow.loop.evidence}
              </div>
            </>
          )}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="flex items-center gap-2 font-semibold"><ShieldAlert className="size-4 text-red-400" /> 反模式</h2>
          <div className="mt-3 space-y-3">
            {slice.antiPatterns.map((ap) => (
              <details key={ap.name} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <summary className="cursor-pointer text-sm font-medium text-red-300">{ap.name}</summary>
                <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
                  {ap.manifestation && <p><span className="text-[var(--muted)]">表现：</span>{ap.manifestation}</p>}
                  {ap.whyItFails && <p><span className="text-[var(--muted)]">为何失败：</span>{ap.whyItFails}</p>}
                  {ap.correction && <p><span className="text-[var(--muted)]">纠偏：</span><span className="text-emerald-300">{ap.correction}</span></p>}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
