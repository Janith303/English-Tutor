export function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
      <svg
        className="w-3.5 h-3.5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
}

export function inputClass(hasError) {
  return `w-full bg-white border-2 rounded-xl px-4 py-3 text-sm text-black focus:outline-none transition-colors placeholder-gray-600 ${
    hasError
      ? "border-red-500 bg-red-50 focus:border-red-600"
      : "border-black focus:border-black"
  }`;
}

export function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-black tracking-widest uppercase mb-1.5">
      {children}
    </label>
  );
}

export function CharCount({ value, max }) {
  const len = (value || "").length;
  const near = len > max * 0.85;
  const over = len > max;
  return (
    <span
      className={`text-xs ml-auto ${over ? "text-red-500" : near ? "text-amber-500" : "text-gray-400"}`}
    >
      {len}/{max}
    </span>
  );
}
