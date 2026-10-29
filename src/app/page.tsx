import { MatrixView } from "@/components/matrix-view";
import { loadSlices } from "@/lib/content";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          解码软件研发的
          <span className="text-[var(--hierarchical)]">高阶暗知识</span>
          与
          <span className="text-[var(--ai-native)]">工程哲学</span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          对齐传统互联网大厂（P6-P10）与前沿 AI-Native 组织的思考模型、决策取舍与工作流实践。
          剥离职级黑话，沉淀特定段位下如何思考、破局、做取舍的隐性实践知识（Tacit Knowledge）。
        </p>
      </section>
      <MatrixView slices={loadSlices()} />
    </div>
  );
}
