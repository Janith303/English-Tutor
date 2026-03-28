import { FieldError, FieldLabel, inputClass, CharCount } from "../ui/FormField";
import RichTextEditor from "./RichTextEditor";
import { validateField } from "../../utils/courseFormValidation";

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function BasicInfoForm({ formData, errors, onChange, onBlur }) {
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  const handleBlur = (field) => () => {
    onBlur(field, formData[field]);
  };

  const handleGenerateSlug = () => {
    const slug = generateSlug(formData.title || "");
    onChange("slug", slug);
    onBlur("slug", slug);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-1">Basic Info</h2>
        <p className="text-sm text-black leading-relaxed">
          Provide basic information about the course to help students understand
          the value proposition.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Course Title</FieldLabel>
          <CharCount value={formData.title} max={120} />
        </div>
        <input
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
        <FieldLabel>URL Slug</FieldLabel>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange("slug")}
              onBlur={handleBlur("slug")}
              placeholder="url-slug-will-appear-here"
              className={inputClass(!!errors.slug)}
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateSlug}
            disabled={!formData.title?.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 rounded-xl transition-colors whitespace-nowrap"
          >
            Generate
          </button>
        </div>
        <FieldError message={errors.slug} />
        {!errors.slug && formData.slug && (
          <p className="text-xs text-gray-400 mt-1.5">
            Preview:{" "}
            <span className="text-blue-500">
              englishtutor.com/courses/{formData.slug}
            </span>
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Summary</FieldLabel>
          <CharCount value={formData.summary} max={300} />
        </div>
        <textarea
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

      <RichTextEditor
        label="Full Description"
        name="description"
        value={formData.description}
        onChange={(val) => {
          onChange("description", val);
          onBlur("description", val);
        }}
        error={errors.description}
        placeholder="Write a comprehensive description of your course content, objectives, and what students will achieve..."
      />
    </div>
  );
}
