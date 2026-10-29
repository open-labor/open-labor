"use client";

export interface RadarPoint {
  label: string;
  score: number; // 0-5
}

const SIZE = 260;
const C = SIZE / 2;
const R = 100;

function axisPoint(i: number, total: number, radius: number): [number, number] {
  const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
  return [C + radius * Math.cos(angle), C + radius * Math.sin(angle)];
}

export function RadarChart({ points, accent }: { points: RadarPoint[]; accent: string }) {
  const n = points.length;
  const rings = [1, 2, 3, 4, 5];
  const valuePolygon = points
    .map((p, i) => axisPoint(i, n, (Math.max(0, Math.min(5, p.score)) / 5) * R).join(","))
    .join(" ");

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="能力雷达图">
      {rings.map((r) => (
        <polygon
          key={r}
          points={points.map((_, i) => axisPoint(i, n, (r / 5) * R).join(",")).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {points.map((_, i) => {
        const [x, y] = axisPoint(i, n, R);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--border)" strokeWidth={1} />;
      })}
      <polygon points={valuePolygon} fill={accent} fillOpacity={0.25} stroke={accent} strokeWidth={2} />
      {points.map((p, i) => {
        const [x, y] = axisPoint(i, n, (Math.max(0, Math.min(5, p.score)) / 5) * R);
        return <circle key={i} cx={x} cy={y} r={3} fill={accent} />;
      })}
      {points.map((p, i) => {
        const [x, y] = axisPoint(i, n, R + 22);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--muted)"
          >
            {p.label} {p.score > 0 ? p.score.toFixed(1) : ""}
          </text>
        );
      })}
    </svg>
  );
}
