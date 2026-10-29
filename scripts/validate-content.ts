/**
 * 独立语料校验：不启动 Next 构建，秒级校验 content 目录下全部切片。
 * 用法：pnpm validate:content
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { laborCorpusSchema } from "../src/types/labor-corpus";

const CONTENT_DIR = path.join(process.cwd(), "content");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : e.name.endsWith(".mdx") ? [full] : [];
  });
}

const files = walk(CONTENT_DIR);
if (files.length === 0) {
  console.error("content/ 下没有任何 .mdx 语料");
  process.exit(1);
}

let failed = false;
for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const { data } = matter(fs.readFileSync(file, "utf8"));
  const parsed = laborCorpusSchema.safeParse(data);
  if (!parsed.success) {
    failed = true;
    console.error(`✗ ${rel}`);
    for (const issue of parsed.error.issues) {
      console.error(`    - ${issue.path.join(".")}: ${issue.message}`);
    }
    continue;
  }
  const id = (data as { id: string }).id;
  if (id !== path.basename(file, ".mdx")) {
    failed = true;
    console.error(`✗ ${rel}\n    - id「${id}」与文件名不一致`);
    continue;
  }
  const dims = new Set(parsed.data.self_assessment_checks.map((c) => c.dimension ?? "decision"));
  if (dims.size < 5) {
    failed = true;
    console.error(
      `✗ ${rel}\n    - 自评维度仅覆盖 ${dims.size} 个，需覆盖 decision/boundary/leverage/loop/antipattern 五维`
    );
    continue;
  }
  console.log(`✓ ${rel}`);
}

if (failed) {
  console.error("\n语料校验未通过，请修复后重试（Schema 见 src/types/labor-corpus.ts）。");
  process.exit(1);
}
console.log(`\n全部 ${files.length} 篇语料校验通过`);
