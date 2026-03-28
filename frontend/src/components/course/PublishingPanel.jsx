import { useState } from "react";

export default function PublishingPanel() {
  const [publishMode, setPublishMode] = useState("Draft Mode");
  const [visibility, setVisibility] = useState({
    publicMarketplace: true,
    searchIndexing: false,
    autoEnroll: true,
  });

  const toggleVisibility = (key) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold text-black tracking-widest uppercase mb-3">
          Publishing Status
        </p>

        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
            <span className="text-sm font-semibold text-orange-700">
              Live Status
            </span>
          </div>
          <span className="text-xs font-bold text-orange-500 tracking-wider">
            DRAFT
          </span>
        </div>

        <div className="relative">
          <select
            value={publishMode}
            onChange={(e) => setPublishMode(e.target.value)}
            className="w-full appearance-none bg-white border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black font-medium focus:outline-none focus:border-black cursor-pointer"
          >
            <option>Draft Mode</option>
            <option>Published</option>
            <option>Archived</option>
          </select>
          <svg
            className="w-4 h-4 text-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
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

      <div>
        <p className="text-xs font-semibold text-black tracking-widest uppercase mb-3">
          Visibility Settings
        </p>
        <div className="flex flex-col gap-3">
          {[
            { key: "publicMarketplace", label: "Show in public marketplace" },
            { key: "searchIndexing", label: "Allow search indexing" },
            { key: "autoEnroll", label: "Auto-enroll existing students" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div
                onClick={() => toggleVisibility(key)}
                className={`w-5 h-5 mt-0.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                  visibility[key]
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300 group-hover:border-blue-400"
                }`}
              >
                {visibility[key] && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-black leading-snug">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
