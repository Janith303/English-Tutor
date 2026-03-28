import { useState } from "react";

export default function EnrollmentBarChart({ data }) {
  const [view, setView] = useState("monthly");
  const [hoveredBar, setHoveredBar] = useState(null);
  const maxValue = Math.max(...data.map((d) => d.enrollments));
  const peakBar = data.find((d) => d.enrollments === maxValue);

  const chartHeight = 200;
  const barWidth = 42;
  const gap = 14;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <div className="bg-blue-100 rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-bold text-black text-lg">Total Enrollments</h3>
          <p className="text-sm text-black mt-0.5">
            Trends over the last 30 days
          </p>
        </div>
        <button
          onClick={() => setView(view === "monthly" ? "weekly" : "monthly")}
          className="text-sm font-semibold text-black hover:underline"
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
          {data.map((d, i) => {
            const barH = (d.enrollments / maxValue) * chartHeight;
            const x = i * (barWidth + gap);
            const y = chartHeight - barH + 80;
            const isPeak = d.enrollments === maxValue;

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
                      {d.enrollments}
                    </text>

                    <polygon
                      points={`${x + barWidth / 2 - 4},${y - 6} ${x + barWidth / 2 + 4},${y - 6} ${x + barWidth / 2},${y}`}
                      fill="#1e3a8a"
                    />
                  </g>
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
                      enrollments: d.enrollments,
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
                x={hoveredBar.x - 35}
                y={hoveredBar.y - 50}
                width={70}
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
                Day {hoveredBar.day}
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
        <span className="text-xs text-black">30 DAYS AGO</span>
        <span className="text-xs text-black">TODAY</span>
      </div>
    </div>
  );
}
