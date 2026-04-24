import { FieldError, CharCount } from "../ui/FormField";

const labelClass = "block text-base font-semibold text-black";

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-slate-50 px-4 py-3 text-base text-slate-700 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:outline-none ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
  }`;

export default function BasicInfoForm({ formData, errors, onChange, onBlur }) {
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  const handleBlur = (field) => () => {
    onBlur(field, formData[field]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col gap-7">
      <div>
        <h2 className="text-xl font-bold text-black mb-3">Basic Info</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Provide basic information about the course to help students understand
          the value proposition.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="course-title" className={labelClass}>
            Course Title
          </label>
          <CharCount value={formData.title} max={120} />
        </div>
        <input
          id="course-title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange("title")}
          onBlur={handleBlur("title")}
          placeholder="Enter a clear, descriptive course title"
          className={inputClass(!!errors.title)}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="course-summary" className={labelClass}>
            Summary
          </label>
          <CharCount value={formData.summary} max={300} />
        </div>
        <textarea
          id="course-summary"
          name="summary"
          value={formData.summary}
          onChange={handleChange("summary")}
          onBlur={handleBlur("summary")}
          placeholder="A short description of what students will learn (20–300 characters)"
          rows={3}
          className={`${inputClass(!!errors.summary)} resize-y`}
        />
        <FieldError message={errors.summary} />
      </div>
    </div>
  );
}
