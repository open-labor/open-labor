"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import type { SliceVM } from "@/lib/schema";
import { accentOf } from "@/lib/schema";
import { SelfAssessment } from "./self-assessment";

export function AssessmentLauncher({ slice }: { slice: SliceVM }) {
  const [open, setOpen] = useState(false);
  const accent = accentOf(slice.paradigm);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        style={{ background: accent }}
      >
        <ClipboardCheck className="size-4" />
        开始行为锚点自评
      </button>
      <SelfAssessment slice={slice} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
