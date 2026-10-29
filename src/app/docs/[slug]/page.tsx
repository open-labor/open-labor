import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { ArrowLeft } from "lucide-react";

const SLUGS = ["contribution", "redaction", "tier-axis"];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!SLUGS.includes(slug)) notFound();
  const md = fs.readFileSync(path.join(process.cwd(), "docs", `${slug}.md`), "utf8");
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/corpus"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="size-4" /> 返回语料索引
      </Link>
      <article className="md-doc rounded-xl border border-[var(--border)] bg-[var(--panel)] p-8">
        <Markdown>{md}</Markdown>
      </article>
    </div>
  );
}
