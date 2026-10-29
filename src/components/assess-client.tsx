"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { Download, Upload } from "lucide-react";
import { RadarChart } from "@/components/radar-chart";
import type { SliceVM } from "@/lib/schema";
import { ASSESSMENT_DIMENSIONS_VIEW, DIMENSION_ADVICE, accentOf } from "@/lib/schema";
import {
  aggregateChecks,
  checkKey,
  exportUserData,
  importUserData,
  levelVerdict,
  loadAnswers,
  loadGlobalSnapshots,
  saveAnswers,
  saveGlobalSnapshot,
  type Answers,
} from "@/lib/assessment";

const SCORES = [1, 2, 3, 4, 5] as const;

export function AssessClient({ slices }: { slices: SliceVM[] }) {
  const [answers, setAnswers] = useState<Answers>(() => loadAnswers("global"));
  const [showResult, setShowResult] = useState(false);
  const [dataMsg, setDataMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(
    () => ({
      hierarchical: slices.filter((s) => s.paradigm === "hierarchical"),
      "ai-native": slices.filter((s) => s.paradigm === "ai-native"),
    }),
    [slices]
  );

  const totalChecks = slices.reduce((n, s) => n + s.checks.length, 0);
  const answered = Object.keys(answers).length;

  const hierarchicalScores = aggregateChecks(groups.hierarchical, answers);
  const aiNativeScores = aggregateChecks(groups["ai-native"], answers);
  const overallScores = aggregateChecks(slices, answers);
  const weakest = overallScores
    .filter((s) => s.answered > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  function overall(scores: { score: number; total: number }[]) {
    const sum = scores.reduce((a, s) => a + s.score * s.total, 0);
    const tot = scores.reduce((a, s) => a + s.total, 0);
    return tot > 0 ? sum / tot : 0;
  }

  function pick(key: string, score: number) {
    const next = { ...answers, [key]: score };
    setAnswers(next);
    saveAnswers("global", next);
  }

  function gapNote() {
    const h = overall(hierarchicalScores);
    const a = overall(aiNativeScores);
    if (h === 0 && a === 0) return "完成作答后生成双坐标画像。";
    const diff = h - a;
    const lead = diff > 0.3 ? "你的行为习惯更贴近传统层级范式" : diff < -0.3 ? "你的行为习惯更贴近 AI-Native 范式" : "你在两套范式下的行为接近度相当";
    return `${lead}（层级 ${h.toFixed(2)} vs AI-Native ${a.toFixed(2)}）。高分不代表范式优劣，只代表你的默认反应模式与哪套体系的预期行为更匹配。`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">自评与对齐雷达</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          同一批情境判断题，分别在两套范式的坐标系下计分：输出你的认知在传统层级与 AI-Native 双坐标下的映射画像。
          已答 {answered}/{totalChecks}。
        </p>
      </div>

      {(["hierarchical", "ai-native"] as const).map((p) => (
        <section key={p} className="space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: accentOf(p) }}>
            {p === "hierarchical" ? "传统层级坐标系" : "AI-Native 坐标系"}
          </h2>
          {groups[p].map((slice) => {
            const sliceAnswered = slice.checks.filter((c) => answers[checkKey(slice.id, c.id)] != null).length;
            return (
              <details key={slice.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  {slice.organizationZh} · {slice.levelOrRole}
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    {sliceAnswered}/{slice.checks.length} 已答
                  </span>
                </summary>
                <div className="mt-4 space-y-5">
                  {slice.checks.map((c) => {
                    const key = checkKey(slice.id, c.id);
                    return (
                      <div key={key}>
                        <p className="text-[13px] leading-relaxed">{c.question}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex flex-1 gap-1.5">
                            {SCORES.map((s) => (
                              <button
                                key={s}
                                onClick={() => pick(key, s)}
                                className={`w-9 rounded-lg border py-1 text-sm font-mono transition ${
                                  answers[key] === s
                                    ? "border-[var(--ai-native)]/70 bg-[var(--ai-native)]/10"
                                    : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <span className="text-[11px] text-[var(--muted)]">{c.dimension}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </section>
      ))}

      <div className="sticky bottom-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">{gapNote()}</p>
          <button
            disabled={answered === 0}
            onClick={() => {
              if (!showResult) {
                const anyH = hierarchicalScores.some((s) => s.answered > 0);
                const anyA = aiNativeScores.some((s) => s.answered > 0);
                saveGlobalSnapshot(
                  anyH ? overall(hierarchicalScores) : 0,
                  anyA ? overall(aiNativeScores) : 0
                );
              }
              setShowResult((v) => !v);
            }}
            className="rounded-lg bg-[var(--ai-native)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {showResult ? "收起画像" : "生成双坐标画像"}
          </button>
        </div>
        {showResult && (
          <div className="mt-4 grid gap-6 border-t border-[var(--border)] pt-4 md:grid-cols-2">
            {(["hierarchical", "ai-native"] as const).map((p) => {
              const scores = p === "hierarchical" ? hierarchicalScores : aiNativeScores;
              const any = scores.some((s) => s.answered > 0);
              return (
                <div key={p} className="flex flex-col items-center gap-2">
                  <div className="text-sm font-medium" style={{ color: accentOf(p) }}>
                    {p === "hierarchical" ? "传统层级坐标系" : "AI-Native 坐标系"}
                    {!any && <span className="ml-2 text-xs text-[var(--muted)]">（该侧未作答）</span>}
                  </div>
                  {any && (
                    <RadarChart
                      points={scores.map((s) => ({ label: s.label, score: s.score }))}
                      accent={accentOf(p)}
                    />
                  )}
                  {any && (
                    <div className="w-full space-y-1 text-xs text-[var(--muted)]">
                      {scores.map((s) => (
                        <div key={s.dimension} className="flex items-center justify-between gap-3">
                          <span>{s.label}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded bg-[var(--border)]">
                            <div
                              className="h-full rounded"
                              style={{ width: `${(s.score / 5) * 100}%`, background: accentOf(p) }}
                            />
                          </div>
                          <span className="font-mono">{s.score.toFixed(1)}</span>
                        </div>
                      ))}
                      <p className="pt-1 text-[11px] leading-relaxed">
                        {levelVerdict(overall(scores)).note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {showResult && weakest.length > 0 && (
          <GrowthAdvice weakest={weakest} slices={slices} />
        )}
        {showResult && <Trajectory />}
      </div>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        维度说明：{ASSESSMENT_DIMENSIONS_VIEW.map((d) => d.label).join(" / ")}。
        作答数据仅保存在你的浏览器 localStorage 中，不会上传。
      </p>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <span className="text-xs font-medium text-[var(--muted)]">数据管理（本地）：</span>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(exportUserData(), null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `open-labor-assessment-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setDataMsg("已导出");
            setTimeout(() => setDataMsg(""), 2000);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--panel-2)]"
        >
          <Download className="size-3.5" /> 导出全部数据
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--panel-2)]"
        >
          <Upload className="size-3.5" /> 导入数据
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const r = importUserData(JSON.parse(await f.text()));
              setAnswers(loadAnswers("global"));
              setDataMsg(`已导入 ${r.answerKeys} 组作答与 ${r.snapshots} 条轨迹快照`);
            } catch {
              setDataMsg("导入失败：文件格式不正确");
            }
            setTimeout(() => setDataMsg(""), 4000);
            e.target.value = "";
          }}
        />
        {dataMsg && <span className="text-xs text-emerald-300">{dataMsg}</span>}
      </div>
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 180;
  const h = 44;
  const x = (i: number) => (i / (values.length - 1)) * (w - 8) + 4;
  const y = (v: number) =>
    h - 4 - (Math.max(0, Math.min(5, v)) / 5) * (h - 8);
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <line x1={4} y1={h - 4} x2={w - 4} y2={h - 4} stroke="var(--border)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

function Trajectory() {
  const snaps = loadGlobalSnapshots();
  if (snaps.length === 0) return null;
  const first = snaps[0];
  const last = snaps[snaps.length - 1];
  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">成长轨迹</h3>
        <span className="text-xs text-[var(--muted)]">
          {snaps.length} 次画像 · 最近 {new Date(last.t).toLocaleDateString()}
        </span>
      </div>
      {snaps.length >= 2 ? (
        <div className="mt-3 flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <div className="text-xs" style={{ color: "var(--hierarchical)" }}>
              传统层级：{first.hierarchical.toFixed(1)} → {last.hierarchical.toFixed(1)}
            </div>
            <Sparkline
              values={snaps.map((s) => s.hierarchical)}
              color="var(--hierarchical)"
            />
          </div>
          <div>
            <div className="text-xs" style={{ color: "var(--ai-native)" }}>
              AI-Native：{first.aiNative.toFixed(1)} → {last.aiNative.toFixed(1)}
            </div>
            <Sparkline
              values={snaps.map((s) => s.aiNative)}
              color="var(--ai-native)"
            />
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-[var(--muted)]">
            每次生成画像落一条快照（仅存本地浏览器）。趋势反映自评行为锚点随时间的漂移，
            建议以固定周期（如双周）生成以获得可比序列。
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-[var(--muted)]">
          下一次生成画像后开始呈现趋势（至少 2 条快照）。
        </p>
      )}
    </div>
  );
}

function GrowthAdvice({
  weakest,
  slices,
}: {
  weakest: { dimension: keyof typeof DIMENSION_ADVICE; label: string; score: number }[];
  slices: SliceVM[];
}) {
  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <h3 className="text-sm font-medium">成长建议 · 针对短板维度</h3>
      <div className="mt-3 space-y-3">
        {weakest.map((w) => {
          const adv = DIMENSION_ADVICE[w.dimension];
          return (
            <div key={w.dimension} className="rounded-lg border border-[var(--border)] p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{w.label}</span>
                <span className="text-xs text-[var(--muted)]">当前 {w.score.toFixed(1)} / 5</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{adv.advice}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-[var(--muted)]">推荐阅读：</span>
                {adv.recommended.map((id) => {
                  const s = slices.find((x) => x.id === id);
                  return s ? (
                    <Link
                      key={id}
                      href={`/slice/${id}`}
                      className="rounded border border-[var(--border)] px-2 py-0.5 text-xs hover:bg-[var(--panel-2)]"
                    >
                      {s.organizationZh} · {s.levelOrRole}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
