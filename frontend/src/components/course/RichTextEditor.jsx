import { useRef } from "react";
import { FieldError, FieldLabel } from "../ui/FormField";

const ToolbarButton = ({ title, children, onClick }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    onMouseDown={(event) => {
      // Keep textarea selection active so toolbar actions apply to selected text.
      event.preventDefault();
    }}
    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-black hover:text-black transition-colors text-sm font-bold"
  >
    {children}
  </button>
);

export default function RichTextEditor({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
}) {
  const ref = useRef();

  const getSelectionRange = () => {
    const el = ref.current;
    if (!el) {
      return { start: 0, end: 0 };
    }

    const start = Number.isInteger(el.selectionStart) ? el.selectionStart : 0;
    const end = Number.isInteger(el.selectionEnd) ? el.selectionEnd : start;
    return start <= end ? { start, end } : { start: end, end: start };
  };

  const wrap = (before, after = before) => {
    const el = ref.current;
    const { start, end } = getSelectionRange();
    const selected = value.slice(start, end);
    const newVal =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);

    setTimeout(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleKeyDown = (event) => {
    const key = String(event.key || "").toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === "b") {
      event.preventDefault();
      wrap("**");
      return;
    }

    if ((event.ctrlKey || event.metaKey) && key === "i") {
      event.preventDefault();
      wrap("_");
    }
  };

  const hasError = !!error;

  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div
        className={`rounded-lg border overflow-hidden transition-colors focus-within:ring-2 ${
          hasError
            ? "border-red-400 bg-red-50 focus-within:border-red-500 focus-within:ring-red-200"
            : "border-slate-400 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-indigo-500"
        }`}
      >
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-300 bg-slate-50">
          <ToolbarButton title="Bold" onClick={() => wrap("**")}>
            B
          </ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => wrap("_")}>
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton title="Bullet list" onClick={() => wrap("\n- ", "")}>
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </ToolbarButton>
          <ToolbarButton title="Link" onClick={() => wrap("[", "](url)")}>
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
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </ToolbarButton>
          <ToolbarButton title="Image">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </ToolbarButton>
          <span className="ml-auto text-xs text-slate-400">
            {value.length} chars
          </span>
        </div>

        <textarea
          ref={ref}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={7}
          className={`w-full px-4 py-3 text-base text-slate-700 resize-y focus:outline-none placeholder:text-slate-500 ${
            hasError ? "bg-red-50" : "bg-slate-50 focus:bg-white"
          }`}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}
