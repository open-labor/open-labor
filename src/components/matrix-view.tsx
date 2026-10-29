"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SliceVM } from "@/lib/schema";
import { accentOf, scenarioLabel } from "@/lib/schema";
import { ParadigmSwitch, type ParadigmFilter } from "./paradigm-switch";

function RowHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <th scope="row" className="sticky left-0 z-10 w-36 bg-[var(--panel)] p-3 text-left align-top">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-0.5 text-xs font-normal text-[var(--muted)]">{hint}</div>
    </th>
  );
}

export function MatrixView({
  slices,
  initialParadigm = "all",
}: {
  slices: SliceVM[];
  initialParadigm?: ParadigmFilter;
}) {
  const [filter, setFilter] = useState<ParadigmFilter>(initialParadigm);
  const visible = slices
    .filter((s) => filter === "all" || s.paradigm === filter)
    .sort((a, b) => a.tierAxis - b.tierAxis);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">双模知识矩阵</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            横轴：组织切片（按级别标尺排列）· 纵轴：思维维度 · 点击列头进入切片详情
          </p>
        </div>
        <ParadigmSwitch value={filter} onChange={setFilter} />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--muted)]">
          该标尺下暂无切片，欢迎通过「填报」向导提交。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <table className="w-full border-collapse text-[13px] leading-relaxed">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="sticky left-0 z-10 w-36 bg-[var(--panel)]" />
                {visible.map((s) => (
                  <th key={s.id} className="min-w-72 p-3 text-left align-top">
                    <Link href={`/slice/${s.id}`} className="group block">
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                          style={{
                            color: accentOf(s.paradigm),
                            background: `color-mix(in srgb, ${accentOf(s.paradigm)} 14%, transparent)`,
                          }}
                        >
                          {s.paradigm === "hierarchical" ? "层级" : "AI-N"}
                        </span>
                        <span className="font-semibold">{s.organizationZh}</span>
                        <span className="text-[var(--muted)]">{s.levelOrRole}</span>
                        <ArrowUpRight className="size-3.5 text-[var(--muted)] opacity-0 transition group-hover:opacity-100" />
                      </div>
                      <div className="mt-1 text-xs font-normal text-[var(--muted)]">
                        {s.domainZh}
                        {s.versionTag ? ` · ${s.versionTag}` : ""}
                      </div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <RowHeader title="级别标尺" hint="tier_axis 1-10" />
                {visible.map((s) => (
                  <td key={s.id} className="p-3 align-top">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded bg-[var(--border)]">
                        <div
                          className="h-full rounded"
                          style={{ width: `${(s.tierAxis / 10) * 100}%`, background: accentOf(s.paradigm) }}
                        />
                      </div>
                      <span className="font-mono text-xs text-[var(--muted)]">{s.tierAxis}</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--border)]">
                <RowHeader title="决策假设" hint="底层第一性原理" />
                {visible.map((s) => (
                  <td key={s.id} className="p-3 align-top">
                    <ul className="list-disc space-y-1.5 pl-4 text-[var(--text)]/90">
                      {s.mentalModels.assumptions.slice(0, 2).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--border)]">
                <RowHeader title="首要指标" hint="含伪信号警示" />
                {visible.map((s) => (
                  <td key={s.id} className="p-3 align-top">
                    <div className="space-y-1.5">
                      {s.mentalModels.metrics.slice(0, 3).map((m, i) => (
                        <div key={i}>
                          <span className="font-medium">{m.name}</span>
                          {m.antiSignal && (
                            <span className="ml-1 text-xs text-red-400/80" title={m.antiSignal}>
                              ⚠ 伪信号
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--border)]">
                <RowHeader title="边界认知" hint="管 / 不管 / 越界机制" />
                {visible.map((s) => (
                  <td key={s.id} className="p-3 align-top text-[var(--text)]/90">
                    {s.mentalModels.boundary[0] ?? "—"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--border)]">
                <RowHeader title="典型场景" hint="冲突 → 打法 → 权衡" />
                {visible.map((s) => (
                  <td key={s.id} className="p-3 align-top">
                    <div className="space-y-2">
                      {s.scenarios.map((sc) => (
                        <Link
                          key={sc.id}
                          href={`/contrast?category=${sc.category ?? ""}`}
                          className="block rounded-lg border border-[var(--border)] px-2.5 py-1.5 transition hover:bg-[var(--panel-2)]"
                        >
                          <span className="mr-1.5 rounded bg-[var(--panel-2)] px-1.5 py-0.5 text-[11px] text-[var(--muted)]">
                            {scenarioLabel(sc.category)}
                          </span>
                          {sc.title.slice(0, 40)}…
                        </Link>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--border)]">
                <RowHeader title="交付闭环" hint="节奏与证据物" />
                {visible.map((s) => (
                  <td key={s.id} className="p-3 align-top text-[var(--text)]/90">
                    <div className="font-medium">{s.workflow.loop?.cadence ?? "—"}</div>
                    {s.workflow.loop && (
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        证据物：{s.workflow.loop.evidence}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <RowHeader title="反模式" hint="伪高阶表现" />
                {visible.map((s) => (
                  <td key={s.id} className="p-3 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {s.antiPatterns.map((ap) => (
                        <span
                          key={ap.name}
                          className="rounded-md border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs text-red-300"
                        >
                          {ap.name}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
