import { useState } from "react";

function formatPointDate(point) {
  if (!point?.date) {
    return `Day ${point?.day ?? "-"}`;
  }

  const parsed = new Date(point.date);
  if (Number.isNaN(parsed.getTime())) {
    return `Day ${point?.day ?? "-"}`;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EnrollmentBarChart({ data }) {
  const [view, setView] = useState("monthly");
  const [hoveredBar, setHoveredBar] = useState(null);
  const chartData =
    Array.isArray(data) && data.length > 0
      ? data
      : Array.from({ length: 30 }, (_, index) => ({
          day: index + 1,
          enrollments: 0,
        }));

  const hasEnrollments = chartData.some(
    (point) => Number(point?.enrollments || 0) > 0,
  );
  const maxValue = hasEnrollments
    ? Math.max(...chartData.map((d) => Number(d?.enrollments || 0)))
    : 1;

  const chartHeight = 200;
  const barWidth = 42;
  const gap = 14;
  const totalWidth = chartData.length * (barWidth + gap) - gap;
  const baselineY = chartHeight + 80;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-black mb-2">
            Total Enrollments
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Trends over the last 30 days
          </p>
        </div>
        <button
          onClick={() => setView(view === "monthly" ? "weekly" : "monthly")}
          className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          {view === "monthly" ? "Monthly View" : "Weekly View"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalWidth + 20} ${chartHeight + 150}`}
          className="w-full"
          style={{ minWidth: "400px" }}
        >
          {!hasEnrollments && (
            <g>
              <line
                x1={0}
                y1={baselineY}
                x2={Math.max(totalWidth, 0)}
                y2={baselineY}
                stroke="#475569"
                strokeWidth={2}
                strokeDasharray="5 4"
              />
              <text
                x={(totalWidth + 20) / 2}
                y={baselineY - 14}
                textAnchor="middle"
                fill="#334155"
                fontSize="12"
                fontWeight="600"
              >
                No enrollments yet
              </text>
            </g>
          )}

          {chartData.map((d, i) => {
            const enrollments = Number(d?.enrollments || 0);
            const barH = (enrollments / maxValue) * chartHeight;
            const x = i * (barWidth + gap);
            const y = chartHeight - barH + 80;
            const isPeak = hasEnrollments && enrollments === maxValue;
            const isZeroDay = enrollments === 0;

            return (
              <g key={d.day}>
                {isPeak && (
                  <g>
                    <rect
                      x={x + barWidth / 2 - 22}
                      y={y - 32}
                      width={44}
                      height={26}
                      rx={6}
                      fill="#1e3a8a"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 22}
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="600"
                    >
                      Peak:
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={y - 12}
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {enrollments}
                    </text>

                    <polygon
                      points={`${x + barWidth / 2 - 4},${y - 6} ${x + barWidth / 2 + 4},${y - 6} ${x + barWidth / 2},${y}`}
                      fill="#1e3a8a"
                    />
                  </g>
                )}

                {isZeroDay && (
                  <line
                    x1={x + 6}
                    y1={baselineY}
                    x2={x + barWidth - 6}
                    y2={baselineY}
                    stroke="#475569"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                )}

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={6}
                  fill={isPeak ? "#000000" : "#000000"}
                  className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  onMouseEnter={() =>
                    setHoveredBar({
                      day: d.day,
                      dateLabel: formatPointDate(d),
                      enrollments,
                      x: x + barWidth / 2,
                      y: y,
                    })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                />
              </g>
            );
          })}

          {hoveredBar && (
            <g>
              <rect
                x={hoveredBar.x - 62}
                y={hoveredBar.y - 50}
                width={124}
                height={35}
                rx={6}
                fill="#1e3a8a"
                opacity="0.95"
              />
              <text
                x={hoveredBar.x}
                y={hoveredBar.y - 32}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="600"
              >
                {hoveredBar.dateLabel}
              </text>
              <text
                x={hoveredBar.x}
                y={hoveredBar.y - 18}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="700"
              >
                {hoveredBar.enrollments}
              </text>
              <polygon
                points={`${hoveredBar.x - 4},${hoveredBar.y - 5} ${hoveredBar.x + 4},${hoveredBar.y - 5} ${hoveredBar.x},${hoveredBar.y}`}
                fill="#1e3a8a"
                opacity="0.95"
              />
            </g>
          )}
        </svg>
      </div>

      <div className="flex justify-between mt-1 px-1">
        <span className="text-xs font-semibold text-slate-600">
          30 DAYS AGO
        </span>
        <span className="text-xs font-semibold text-slate-600">TODAY</span>
      </div>
    </div>
  );
}
