import { useState, useCallback } from "react";
import TutorTopNav from "../tutor/TutorTopNav";
import CourseFormTabs from "./CourseFormTabs";
import BasicInfoForm from "./BasicInfoForm";
import CourseMetadataFields from "./CourseMetadataFields";
import ThumbnailUploader from "./ThumbnailUploader";
import PublishingPanel from "./PublishingPanel";
import CourseFormActionBar from "./CourseFormActionBar";
import { tutorProfile } from "../../data/tutorDashboardData";
import {
  validateField,
  validateCourseForm,
} from "../../utils/courseFormValidation";

const INITIAL_FORM = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  category: "",
  level: "",
  duration: "",
  price: "",
  thumbnail: null,
};

export default function EditCoursePage({ onBack }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [sidebarPage, setSidebarPage] = useState("courses");
  const [lastSaved, setLastSaved] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => {
        if (prev[field] || submitAttempted) {
          const err = validateField(field, value);
          setErrors((e) => ({ ...e, [field]: err || undefined }));
        }
        return prev;
      });
    },
    [submitAttempted],
  );

  const handleBlur = useCallback((field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err || undefined }));
  }, []);

  const handleThumbnailChange = (file) => {
    setFormData((prev) => ({ ...prev, thumbnail: file }));
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    const { isValid, errors: allErrors } = validateCourseForm(formData);

    const allTouched = Object.keys(INITIAL_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {},
    );
    setTouched(allTouched);
    setErrors(allErrors);

    if (!isValid) {
      const firstErrorEl = document.querySelector("[data-error]");
      if (firstErrorEl)
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const now = new Date();
    setLastSaved(
      `Last saved: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    );
    alert("✅ Course saved successfully!");
  };

  const handleDiscard = () => {
    if (Object.values(formData).some(Boolean)) {
      if (!window.confirm("Discard all changes? This cannot be undone."))
        return;
    }
    setFormData(INITIAL_FORM);
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
    if (onBack) onBack();
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TutorTopNav
        activePage={sidebarPage}
        onNavigate={(key) => {
          setSidebarPage(key);
          if (key === "dashboard" && onBack) onBack();
        }}
        tutor={tutorProfile}
        onLogout={() => alert("Logged out")}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 pt-7 pb-4">
            <CourseFormTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "basic" && (
              <div className="flex gap-7">
                <div className="flex-1 min-w-0 flex flex-col gap-10">
                  <BasicInfoForm
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <div className="border-t border-gray-100 pt-8">
                    <CourseMetadataFields
                      formData={formData}
                      errors={errors}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                <div className="w-64 flex-shrink-0 flex flex-col gap-5">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <ThumbnailUploader onFileChange={handleThumbnailChange} />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <PublishingPanel />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "structure" && (
              <div className="flex items-center justify-center h-48 text-black text-sm bg-white rounded-2xl border border-gray-100">
                Course Structure — coming soon
              </div>
            )}
          </div>
        </div>

        <CourseFormActionBar
          lastSaved={lastSaved}
          errorCount={errorCount}
          onDiscard={handleDiscard}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
