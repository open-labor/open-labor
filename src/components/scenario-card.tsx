"use client";

import { useState } from "react";
import { AlertTriangle, Swords, Scale } from "lucide-react";
import { accentOf, scenarioLabel } from "@/lib/schema";
import type { ContrastGroup } from "@/lib/content";

export function ScenarioCard({
  groups,
  initialCategory,
}: {
  groups: ContrastGroup[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState(
    groups.find((g) => g.key === initialCategory)?.key ?? groups[0]?.key
  );
  const group = groups.find((g) => g.key === active);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">情境对比卡片</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          同一类工程矛盾下，不同范式、不同层级的真实打法差异。
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => setActive(g.key)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              active === g.key
                ? "border-[var(--ai-native)]/60 bg-[var(--ai-native)]/10 text-[var(--text)]"
                : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {g.label}
            <span className="ml-1.5 text-xs opacity-60">{g.items.length}</span>
          </button>
        ))}
      </div>

      {group && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${group.items.length}, minmax(340px, 1fr))` }}
        >
          {group.items.map((item) => {
            const sc = item.scenario;
            const accent = accentOf(item.paradigm as "hierarchical" | "ai-native");
            return (
              <section
                key={item.sliceId + sc.id}
                className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5"
              >
                <header className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
                  >
                    {item.paradigm === "hierarchical" ? "层级体系" : "AI-Native"}
                  </span>
                  <span className="text-sm font-semibold">
                    {item.org} · {item.levelOrRole}
                  </span>
                </header>

                <div className="rounded-lg bg-[var(--panel-2)] p-3 text-[13px] leading-relaxed">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
                    <Swords className="size-3.5" /> 冲突现场 · {scenarioLabel(sc.category)}
                  </div>
                  {sc.title}
                </div>

                <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3 text-[13px] leading-relaxed">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-red-300">
                    <AlertTriangle className="size-3.5" /> 初阶解法
                  </div>
                  {sc.junior}
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium text-[var(--muted)]">
                    高阶解法{sc.steps ? `（${sc.steps.length} 步）` : ""}
                  </div>
                  {sc.steps ? (
                    <ol className="space-y-2.5">
                      {sc.steps.map((step, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span
                            className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                            style={{ background: accent }}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <div className="text-[13px] leading-relaxed">{step.move}</div>
                            <div className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                              依据：{step.rationale}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-[13px] leading-relaxed">{sc.senior}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
                    <Scale className="size-3.5" /> 权衡取舍
                  </div>
                  {sc.tradeOffDetails ? (
                    sc.tradeOffDetails.map((t, i) => (
                      <div key={i} className="rounded-lg border border-[var(--border)] p-2.5 text-xs leading-relaxed">
                        <span className="font-medium text-emerald-300">选「{t.choose}」</span>
                        <span className="text-[var(--muted)]"> 而非「{t.over}」</span>
                        <div className="mt-1 text-[var(--muted)]">代价：{t.cost}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs leading-relaxed text-[var(--muted)]">{sc.tradeOffs}</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
