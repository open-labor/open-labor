#!/usr/bin/env node
/**
 * 黑话检查：扫描 content 目录下所有 mdx 语料（frontmatter 与正文）中的空洞黑话。
 * 命中即 exit 1（CI 阻断）。词表保守起步，随社区共识扩充。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const JARGON = [
  "赋能",
  "抓手",
  "闭环思维",
  "心智占领",
  "价值主张",
  "顶层设计",
  "组合拳",
  "生态化反",
];

const CONTENT_DIR = path.join(process.cwd(), "content");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : e.name.endsWith(".mdx") ? [full] : [];
  });
}

let failed = false;
for (const file of walk(CONTENT_DIR)) {
  const { content } = matter(fs.readFileSync(file, "utf8"));
  const hits = JARGON.filter((w) => content.includes(w));
  if (hits.length > 0) {
    failed = true;
    console.error(`✗ ${path.relative(process.cwd(), file)} 命中黑话：${hits.join("、")}`);
  }
}

if (failed) {
  console.error("\n黑话检查未通过：请改写为可操作的动作 + 可验证的代价（见 docs/contribution.md）。");
  process.exit(1);
}
console.log("黑话检查通过 ✓");
