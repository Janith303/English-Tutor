import { FieldError, FieldLabel, inputClass } from "../ui/FormField";

function SelectField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  options,
  placeholder,
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name, value)}
          className={`${inputClass(!!error)} appearance-none cursor-pointer pr-9`}
        >
          <option value="">
            {placeholder || `Select ${label.toLowerCase()}`}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
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
      <FieldError message={error} />
    </div>
  );
}

function NumberField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  step,
  prefix,
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-sm font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          name={name}
          value={value}
          step={step || 1}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name, value)}
          placeholder={placeholder}
          className={`${inputClass(!!error)} ${prefix ? "pl-8" : ""}`}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

export default function CourseMetadataFields({
  formData,
  errors,
  onChange,
  onBlur,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-black mb-6">Course Metadata</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectField
          label="Category"
          name="category"
          value={formData.category}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.category}
          options={[
            { value: "presentation-skills", label: "Presentation Skills" },
            { value: "academic-writing", label: "Academic Writing" },
            { value: "grammar", label: "Grammar" },
            {
              value: "career-interview",
              label: "Career Interview Preparation",
            },
            { value: "vocabulary", label: "Vocabulary" },
            { value: "ielts", label: "IELTS" },
          ]}
        />
        <SelectField
          label="Level"
          name="level"
          value={formData.level}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.level}
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
        />
        <NumberField
          label="Duration (hrs)"
          name="duration"
          value={formData.duration}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.duration}
          placeholder="e.g. 24"
          step="0.5"
        />
        <NumberField
          label="Price (LKR)"
          name="price"
          value={formData.price}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.price}
          placeholder="0.00 for free"
          step="0.01"
        />
      </div>
    </div>
  );
}
