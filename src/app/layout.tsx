import type { Metadata } from "next";
import Link from "next/link";
import { Network, GitCompareArrows, Home, ClipboardCheck, FilePlus2, Library, Scale } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Labor — 研发范式对照库",
  description:
    "系统化沉淀传统大厂层级体系与 AI-Native 组织体系的工作方式、心智模型、决策方法论与工程哲学。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid size-7 place-items-center rounded-md bg-[var(--ai-native)]/20 text-[var(--ai-native)]">
                OL
              </span>
              open-labor
            </Link>
            <nav className="flex items-center gap-1 text-sm text-[var(--muted)]">
              <Link href="/" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-[var(--panel-2)] hover:text-[var(--text)]">
                <Home className="size-4" /> 首页
              </Link>
              <Link href="/matrix" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-[var(--panel-2)] hover:text-[var(--text)]">
                <Network className="size-4" /> 矩阵
              </Link>
              <Link href="/paradigm" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-[var(--panel-2)] hover:text-[var(--text)]">
                <Scale className="size-4" /> 范式
              </Link>
              <Link href="/corpus" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-[var(--panel-2)] hover:text-[var(--text)]">
                <Library className="size-4" /> 语料
              </Link>
              <Link href="/contrast" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-[var(--panel-2)] hover:text-[var(--text)]">
                <GitCompareArrows className="size-4" /> 场景对照
              </Link>
              <Link href="/assess" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-[var(--panel-2)] hover:text-[var(--text)]">
                <ClipboardCheck className="size-4" /> 自评
              </Link>
              <Link href="/contribute" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 hover:bg-[var(--panel-2)] hover:text-[var(--text)]">
                <FilePlus2 className="size-4" /> 填报
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
          open-labor · 语料遵循 Schema v1 · 欢迎按 CONTRIBUTING.md 提交切片
        </footer>
      </body>
    </html>
  );
}
