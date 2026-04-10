const STATUS_LABELS = {
  DRAFT: "Draft Mode",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const selectClass =
  "w-full appearance-none cursor-pointer rounded-lg border border-slate-400 bg-slate-50 px-4 py-3 pr-10 text-base text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

export default function PublishingPanel({ value, onChange, disabled = false }) {
  const publishMode = value?.status || "DRAFT";

  const updateStatus = (nextStatus) => {
    if (disabled) return;
    onChange && onChange("status", nextStatus);
  };

  const statusBadgeColor =
    publishMode === "PUBLISHED"
      ? "text-green-700 bg-green-50 border-green-200"
      : publishMode === "ARCHIVED"
        ? "text-slate-700 bg-slate-100 border-slate-200"
        : "text-amber-700 bg-amber-50 border-amber-200";

  const liveDotColor =
    publishMode === "PUBLISHED"
      ? "bg-green-500"
      : publishMode === "ARCHIVED"
        ? "bg-slate-500"
        : "bg-amber-500";

  const liveLabelColor =
    publishMode === "PUBLISHED"
      ? "text-green-700"
      : publishMode === "ARCHIVED"
        ? "text-slate-700"
        : "text-amber-700";

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-base font-semibold text-black mb-3">
          Publishing Status
        </p>

        <div
          className={`border rounded-lg px-4 py-3.5 flex items-center justify-between mb-4 ${statusBadgeColor}`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full inline-block ${liveDotColor}`}
            />
            <span className={`text-sm font-semibold ${liveLabelColor}`}>
              Live Status
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">
            {publishMode}
          </span>
        </div>

        <div className="relative">
          <select
            value={publishMode}
            onChange={(e) => updateStatus(e.target.value)}
            className={selectClass}
            disabled={disabled}
          >
            {Object.entries(STATUS_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <svg
            className="w-4 h-4 text-slate-700 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
