export default function CourseFormActionBar({
  onDiscard,
  onSubmit,
  lastSaved,
  errorCount = 0,
}) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between z-30 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-black text-sm">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{lastSaved || "Not saved yet"}</span>
      </div>

      <div className="flex items-center gap-4">
        {errorCount > 0 && (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorCount} field{errorCount > 1 ? "s" : ""} need
            {errorCount === 1 ? "s" : ""} attention
          </div>
        )}

        <button
          type="button"
          onClick={onDiscard}
          className="text-blue-600 font-semibold text-sm hover:underline"
        >
          Discard Changes
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className={`font-semibold text-sm px-6 py-2.5 rounded-xl transition-all ${
            errorCount > 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          disabled={errorCount > 0}
          title={errorCount > 0 ? "Please fix all errors before saving" : ""}
        >
          Create Course
        </button>
      </div>
    </div>
  );
}
