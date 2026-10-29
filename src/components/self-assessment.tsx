"use client";

import { useEffect, useState } from "react";
import { X, RotateCcw, ClipboardCheck } from "lucide-react";
import type { SliceVM } from "@/lib/schema";
import { accentOf } from "@/lib/schema";
import {
  computeChecks,
  levelVerdict,
  loadAnswers,
  saveAnswers,
  type Answers,
} from "@/lib/assessment";
import { RadarChart } from "./radar-chart";

const SCORES = [1, 2, 3, 4, 5] as const;

export function SelfAssessment({
  slice,
  open,
  onClose,
}: {
  slice: SliceVM;
  open: boolean;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setAnswers(loadAnswers(slice.id));
      setSubmitted(false);
    }
  }, [open, slice.id]);

  const accent = accentOf(slice.paradigm);
  const scores = computeChecks(slice, answers);
  const answeredCount = Object.keys(answers).length;
  const total = slice.checks.length;
  const overall =
    scores.reduce((acc, s) => acc + s.score * s.total, 0) / Math.max(1, total);
  const verdict = levelVerdict(overall);

  function pick(checkId: string, score: number) {
    const next = { ...answers, [checkId]: score };
    setAnswers(next);
    saveAnswers(slice.id, next);
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    saveAnswers(slice.id, {});
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="关闭" className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-[var(--border)] bg-[var(--panel)] shadow-2xl"
        style={{ animation: "slide-in 200ms ease-out" }}
      >
        <style>{`@keyframes slide-in { from { transform: translateX(24px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>

        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <ClipboardCheck className="size-4" style={{ color: accent }} />
              行为锚点自评
            </div>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {slice.organizationZh} · {slice.levelOrRole} · 已答 {answeredCount}/{total}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
              aria-label="重置"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
              aria-label="关闭"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {slice.checks.map((check) => (
            <fieldset key={check.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-4">
              <legend className="px-1 text-xs text-[var(--muted)]">
                情境 · {check.dimension}
              </legend>
              <p className="text-sm leading-relaxed">{check.question}</p>

              {check.anchors ? (
                <div className="mt-3 space-y-2">
                  {check.anchors.map((a) => {
                    const selected = answers[check.id] === a.score;
                    return (
                      <label
                        key={a.score}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                          selected
                            ? "border-[var(--ai-native)]/70 bg-[var(--ai-native)]/10"
                            : "border-transparent hover:border-[var(--border)] hover:bg-[var(--panel)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name={check.id}
                          className="mt-1 accent-[var(--ai-native)]"
                          checked={selected}
                          onChange={() => pick(check.id, a.score)}
                        />
                        <span>
                          <span className="mr-1.5 font-mono text-xs text-[var(--muted)]">{a.score}</span>
                          {a.behavior}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex gap-1.5">
                    {SCORES.map((s) => (
                      <button
                        key={s}
                        onClick={() => pick(check.id, s)}
                        className={`flex-1 rounded-lg border py-1.5 text-sm font-mono transition ${
                          answers[check.id] === s
                            ? "border-[var(--ai-native)]/70 bg-[var(--ai-native)]/10"
                            : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 rounded-lg bg-[var(--panel)] px-3 py-2 text-xs leading-relaxed text-[var(--muted)]">
                    达标锚点参考（3 分）：{check.anchor}
                  </p>
                </div>
              )}
            </fieldset>
          ))}
        </div>

        <div className="border-t border-[var(--border)] px-6 py-4">
          {submitted ? (
            <div className="flex items-start gap-5">
              <RadarChart
                points={scores.map((s) => ({ label: s.label, score: s.score }))}
                accent={accent}
              />
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold" style={{ color: accent }}>
                  {verdict.title}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{verdict.note}</p>
                <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                  {scores.map((s) => (
                    <div key={s.dimension} className="flex items-center justify-between gap-3">
                      <span>{s.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded bg-[var(--border)]">
                        <div
                          className="h-full rounded"
                          style={{ width: `${(s.score / 5) * 100}%`, background: accent }}
                        />
                      </div>
                      <span className="font-mono">{s.score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <button
              disabled={answeredCount < total}
              onClick={() => setSubmitted(true)}
              className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: accent }}
            >
              {answeredCount < total
                ? `还剩 ${total - answeredCount} 个情境未作答`
                : "生成雷达映射"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
