"use client";

import { Layers, Sparkles, Grid3x3 } from "lucide-react";
import type { Paradigm } from "@/lib/schema";

export type ParadigmFilter = Paradigm | "all";

const TABS: { key: ParadigmFilter; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "双范式对照", icon: <Grid3x3 className="size-3.5" /> },
  { key: "hierarchical", label: "传统层级标尺", icon: <Layers className="size-3.5" /> },
  { key: "ai-native", label: "AI-Native 标尺", icon: <Sparkles className="size-3.5" /> },
];

export function ParadigmSwitch({
  value,
  onChange,
}: {
  value: ParadigmFilter;
  onChange: (v: ParadigmFilter) => void;
}) {
  return (
    <div className="flex rounded-lg border border-[var(--border)] bg-[var(--panel)] p-1">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
            value === t.key
              ? "bg-[var(--panel-2)] text-[var(--text)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
