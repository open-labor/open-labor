import Link from "next/link";

const COMPARISONS = [
  {
    dim: "核心心智 · 第一性原理",
    h: {
      core: "确定性交付文化",
      points: [
        "容量第一性：先看水位再谈架构，系统上限由容量决定",
        "资损语言：稳定性用金额表达，才能和业务在同一张表竞争",
        "机制替代人治：两次以上的协调必契约化，人走了机制还在",
      ],
    },
    a: {
      core: "经验主义文化",
      points: [
        "模型能力是涨潮：『现在做不到』的判断都有半衰期",
        "eval 裁决分歧：先写 20 条用例再辩论，答案在实验里",
        "安全并行约束：不做事后补丁，与能力同权重进流程",
      ],
    },
    hRefs: ["alibaba-p7-backend"],
    aRefs: ["anthropic-mts-eval"],
  },
  {
    dim: "决策与取舍 · 如何下注",
    h: {
      core: "敢下注 + 留纠错空间",
      points: [
        "给代价表：量化风险与各选项代价，让决策在信息完整下发生",
        "灰度/回滚兜底：一切改动假设会失败，先答『怎么回滚』",
        "机制化决策：把同类决策固化成红线/门禁，不再重复讨论",
      ],
    },
    a: {
      core: "让数据裁决 + 判据前置",
      points: [
        "分歧转实验：构造让分歧可测量的实验，而非说服对方",
        "小验证大押注：scaling 外推 + 判据前置 + 切换条件",
        "go/no-go：负结果也是可交付结论，排除方向与找到信号同价",
      ],
    },
    hRefs: ["alibaba-p9-strategy"],
    aRefs: ["openai-research-lead"],
  },
  {
    dim: "工作流与杠杆 · 靠什么放大",
    h: {
      core: "组织与平台杠杆",
      points: [
        "预案平台 / 全链路压测 / 评审门禁：把稳定性做成可验收的机制",
        "文档先行 + 委员会决议：跨域协同靠契约与制度兜底",
        "管理者靠管人、拿资源、做横向闭环放大产出",
      ],
    },
    a: {
      core: "模型与 Agent 杠杆",
      points: [
        "coding agent 并行跑 sweep、eval harness 锁定回归",
        "异步 memo + demo 驱动 review，会议只用于辩论",
        "研究经理靠移除摩擦、『不管』放大团队产出",
      ],
    },
    hRefs: ["bytedance-3-2-director"],
    aRefs: ["anthropic-research-manager"],
  },
  {
    dim: "反模式 · 伪高阶表现",
    h: {
      core: "姿态型伪高阶",
      points: [
        "技术高尚化：为炫技引入组件，向下游转移运维税",
        "PPT 架构师：大图落不了地，说不清三个数字",
        "救火英雄：个人能力掩盖预案缺失，成为新单点",
      ],
    },
    a: {
      core: "指标型伪高阶",
      points: [
        "Eval 刷分（Goodhart）：过拟合评测点，指标涨能力不涨",
        "过早工程化：为死方向建生产线，拖慢判断更新",
        "Prompt 拜物教：手调咒语而不沉淀数据与评测",
      ],
    },
    hRefs: ["bytedance-p8-infra"],
    aRefs: ["kimi-product-engineer"],
  },
  {
    dim: "组织与人才 · 边界与成长",
    h: {
      core: "层级是协调杠杆",
      points: [
        "边界是责任田：域内主权清晰，跨域走契约与委员会",
        "成长靠评审闸门：P7 评审 P6，代写方案是越界",
        "管理靠梯队建设：组织是第一产品，人才厚度是护城河",
      ],
    },
    a: {
      core: "扁平是判断杠杆",
      points: [
        "边界是问题定义权：可触碰从数据到 demo 任何一层",
        "成长靠自驱闭环：无层级保护，主动找切入点 + 数据赢得话语权",
        "管理靠移除摩擦：保护人才密度，为研究回路让路",
      ],
    },
    hRefs: ["tencent-t11-architecture"],
    aRefs: ["mimo-junior-researcher"],
  },
];

export default function ParadigmPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">双范式对照总览</h1>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
          从 23 篇切片提炼的两套研发范式根本差异地图。同一个职业、同一类问题，
          两套体系给出的往往不是『更好』与『更差』，而是两套不同的世界模型。
          每维附代表切片，可下钻到实战细节。
        </p>
      </div>

      <div className="space-y-4">
        {COMPARISONS.map((c) => (
          <section
            key={c.dim}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)]"
          >
            <h2 className="border-b border-[var(--border)] bg-[var(--panel-2)] px-5 py-3 text-sm font-semibold">
              {c.dim}
            </h2>
            <div className="grid gap-px md:grid-cols-2">
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{ color: "var(--hierarchical)", background: "color-mix(in srgb, var(--hierarchical) 14%, transparent)" }}
                  >
                    传统层级体系
                  </span>
                  <span className="text-sm font-medium">{c.h.core}</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {c.h.points.map((p) => (
                    <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-[var(--text)]/90">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: "var(--hierarchical)" }} />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.hRefs.map((id) => (
                    <Link
                      key={id}
                      href={`/slice/${id}`}
                      className="rounded border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
                    >
                      {id}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-[var(--border)] p-5 md:border-l md:border-t-0">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                    style={{ color: "var(--ai-native)", background: "color-mix(in srgb, var(--ai-native) 14%, transparent)" }}
                  >
                    AI-Native 体系
                  </span>
                  <span className="text-sm font-medium">{c.a.core}</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {c.a.points.map((p) => (
                    <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-[var(--text)]/90">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: "var(--ai-native)" }} />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.aRefs.map((id) => (
                    <Link
                      key={id}
                      href={`/slice/${id}`}
                      className="rounded border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
                    >
                      {id}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        这张地图是 23 篇切片的高阶抽象——每一条都能在代表切片里找到带约束、带权衡的实战场景。
        两套范式没有绝对优劣：层级范式在规模与确定性上占优，AI-Native 在速度与人才密度上占优；
        真正的分野在于它们对『世界是否可规划』的根本假设。
      </p>
    </div>
  );
}
