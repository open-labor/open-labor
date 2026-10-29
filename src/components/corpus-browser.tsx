"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SliceVM } from "@/lib/schema";
import { PARADIGM_LABEL, accentOf } from "@/lib/schema";

export function CorpusBrowser({ slices }: { slices: SliceVM[] }) {
  const [query, setQuery] = useState("");
  const [paradigm, setParadigm] = useState<"all" | "hierarchical" | "ai-native">("all");
  const [org, setOrg] = useState("");
  const [tier, setTier] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const orgs = useMemo(() => [...new Set(slices.map((s) => s.organization))], [slices]);
  const tiers = useMemo(
    () => [...new Set(slices.map((s) => s.tierAxis))].sort((a, b) => a - b),
    [slices]
  );
  const allTags = useMemo(() => [...new Set(slices.flatMap((s) => s.tags))], [slices]);

  const filtered = useMemo(
    () =>
      slices.filter((s) => {
        if (paradigm !== "all" && s.paradigm !== paradigm) return false;
        if (org && s.organization !== org) return false;
        if (tier != null && s.tierAxis !== tier) return false;
        if (tags.length && !tags.every((t) => s.tags.includes(t))) return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          const hay = [s.title, s.organizationZh, s.levelOrRole, s.summary, ...s.tags]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [slices, paradigm, org, tier, tags, query]
  );

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const reset = () => {
    setQuery("");
    setParadigm("all");
    setOrg("");
    setTier(null);
    setTags([]);
  };

  const active = query.trim() !== "" || paradigm !== "all" || org !== "" || tier != null || tags.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">语料索引</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          共 {slices.length} 篇，当前显示 {filtered.length} 篇。可按关键词、范式、组织、标尺、标签筛选。
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索标题、组织、层级、标签、摘要…"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--ai-native)]/60"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "hierarchical", "ai-native"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setParadigm(p)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              paradigm === p
                ? "border-[var(--ai-native)]/60 bg-[var(--ai-native)]/10"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {p === "all" ? "全部范式" : PARADIGM_LABEL[p]}
          </button>
        ))}
        <select
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs"
        >
          <option value="">全部组织</option>
          {orgs.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {tiers.map((t) => (
          <button
            key={t}
            onClick={() => setTier(tier === t ? null : t)}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              tier === t
                ? "border-[var(--ai-native)]/60 bg-[var(--ai-native)]/10"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            tier {t}
          </button>
        ))}
        {active && (
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--text)]"
          >
            <X className="size-3" /> 重置
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => toggleTag(t)}
            className={`rounded border px-2 py-0.5 text-xs transition ${
              tags.includes(t)
                ? "border-[var(--ai-native)]/60 bg-[var(--ai-native)]/10"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--muted)]">
          没有匹配的切片，试试调整筛选条件。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted)]">
                <th className="p-3">切片</th>
                <th className="p-3">组织</th>
                <th className="p-3">层级 / 角色</th>
                <th className="p-3">范式</th>
                <th className="p-3">标尺</th>
                <th className="p-3">业务周期</th>
                <th className="p-3">来源</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--panel-2)]"
                >
                  <td className="p-3">
                    <Link href={`/slice/${s.id}`} className="font-medium hover:underline">
                      {s.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-[var(--muted)]">
                      {s.domainZh} · {s.tags.slice(0, 3).join(" / ")}
                    </div>
                  </td>
                  <td className="p-3">{s.organizationZh}</td>
                  <td className="p-3">{s.levelOrRole}</td>
                  <td className="p-3">
                    <span style={{ color: accentOf(s.paradigm) }}>{PARADIGM_LABEL[s.paradigm]}</span>
                  </td>
                  <td className="p-3 font-mono">{s.tierAxis}</td>
                  <td className="p-3 text-xs text-[var(--muted)]">{s.versionTag}</td>
                  <td className="p-3 text-xs text-[var(--muted)]" title={s.source.note}>
                    {s.source.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
