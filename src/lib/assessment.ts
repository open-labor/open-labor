import type { SliceVM, AssessmentDimension } from "./schema";
import { ASSESSMENT_DIMENSIONS_VIEW } from "./schema";

export type Answers = Record<string, number>;

export interface DimensionScore {
  dimension: AssessmentDimension;
  label: string;
  score: number; // 0-5，按权重加权
  answered: number;
  total: number;
}

export function computeChecks(slice: SliceVM, answers: Answers): DimensionScore[] {
  return ASSESSMENT_DIMENSIONS_VIEW.map(({ key, label }) => {
    const checks = slice.checks.filter((c) => c.dimension === key);
    let weighted = 0;
    let weightSum = 0;
    let answered = 0;
    for (const c of checks) {
      const a = answers[c.id];
      if (a != null) {
        weighted += a * c.weight;
        weightSum += c.weight;
        answered += 1;
      }
    }
    return {
      dimension: key,
      label,
      score: weightSum > 0 ? weighted / weightSum : 0,
      answered,
      total: checks.length,
    };
  });
}

/** 跨切片聚合：把多个切片的已答题目按维度加权合并 */
export function aggregateChecks(
  slices: SliceVM[],
  answers: Answers
): DimensionScore[] {
  return ASSESSMENT_DIMENSIONS_VIEW.map(({ key, label }) => {
    let weighted = 0;
    let weightSum = 0;
    let answered = 0;
    let total = 0;
    for (const slice of slices) {
      for (const c of slice.checks) {
        if (c.dimension !== key) continue;
        total += 1;
        const a = answers[`${slice.id}:${c.id}`];
        if (a != null) {
          weighted += a * c.weight;
          weightSum += c.weight;
          answered += 1;
        }
      }
    }
    return {
      dimension: key,
      label,
      score: weightSum > 0 ? weighted / weightSum : 0,
      answered,
      total,
    };
  });
}

export function levelVerdict(overall: number): { title: string; note: string } {
  if (overall >= 4.5)
    return { title: "已达标本层", note: "行为锚点稳定命中 4-5 分区间，可对照上一层级切片寻找差距。" };
  if (overall >= 3.5)
    return { title: "本层中期", note: "核心动作已具备，闭环与机制化动作（5 分锚点）是主要差距。" };
  if (overall >= 2.5)
    return { title: "本层早期", note: "能处理单点冲突，跨域机制与杠杆化动作尚未成为默认习惯。" };
  return { title: "跨层期", note: "多数情境仍在初阶行为区间，建议从 3 分锚点的具体动作开始逐项练习。" };
}

const STORAGE_KEY = "open-labor-assessment";

export function loadAnswers(scope: string): Answers {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${scope}`);
    return raw ? (JSON.parse(raw) as Answers) : {};
  } catch {
    return {};
  }
}

export function saveAnswers(scope: string, answers: Answers) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${scope}`, JSON.stringify(answers));
  } catch {
    // 隐私模式等场景下静默失败
  }
}

/** 单切片作答使用 slice id 作为 scope；跨切片 /assess 使用 "global" */
export function checkKey(sliceId: string, checkId: string) {
  return `${sliceId}:${checkId}`;
}

/** 成长轨迹：双坐标画像每次生成时落一条快照，用于观察随时间的漂移 */
export interface TrajectoryPoint {
  t: number;
  hierarchical: number;
  aiNative: number;
}

const TRAJECTORY_KEY = "open-labor-trajectory";

export function saveGlobalSnapshot(hierarchical: number, aiNative: number) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(TRAJECTORY_KEY);
    const list: TrajectoryPoint[] = raw ? JSON.parse(raw) : [];
    list.push({ t: Date.now(), hierarchical, aiNative });
    window.localStorage.setItem(TRAJECTORY_KEY, JSON.stringify(list.slice(-30)));
  } catch {
    // ignore
  }
}

export function loadGlobalSnapshots(): TrajectoryPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TRAJECTORY_KEY);
    return raw ? (JSON.parse(raw) as TrajectoryPoint[]) : [];
  } catch {
    return [];
  }
}

export interface ExportPayload {
  app: "open-labor";
  exportedAt: string;
  answers: Record<string, Answers>;
  trajectory: TrajectoryPoint[];
}

/** 导出全部本地自评数据（作答 + 轨迹），用于跨设备迁移与备份 */
export function exportUserData(): ExportPayload {
  const answers: Record<string, Answers> = {};
  let trajectory: TrajectoryPoint[] = [];
  if (typeof window !== "undefined") {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      if (k.startsWith(`${STORAGE_KEY}:`)) {
        try {
          answers[k] = JSON.parse(window.localStorage.getItem(k)!) as Answers;
        } catch {
          // skip malformed
        }
      }
      if (k === TRAJECTORY_KEY) {
        try {
          trajectory = JSON.parse(window.localStorage.getItem(k)!) as TrajectoryPoint[];
        } catch {
          // skip malformed
        }
      }
    }
  }
  return { app: "open-labor", exportedAt: new Date().toISOString(), answers, trajectory };
}

export function importUserData(
  payload: ExportPayload
): { answerKeys: number; snapshots: number } {
  let answerKeys = 0;
  let snapshots = 0;
  if (typeof window === "undefined" || payload?.app !== "open-labor") {
    return { answerKeys, snapshots };
  }
  if (payload.answers) {
    for (const [k, v] of Object.entries(payload.answers)) {
      if (!k.startsWith(`${STORAGE_KEY}:`) || typeof v !== "object" || v === null) continue;
      window.localStorage.setItem(k, JSON.stringify(v));
      answerKeys++;
    }
  }
  if (Array.isArray(payload.trajectory)) {
    window.localStorage.setItem(TRAJECTORY_KEY, JSON.stringify(payload.trajectory.slice(-30)));
    snapshots = Math.min(payload.trajectory.length, 30);
  }
  return { answerKeys, snapshots };
}
