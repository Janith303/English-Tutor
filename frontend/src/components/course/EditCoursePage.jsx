import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TutorTopNav from "../tutor/TutorTopNav";
import CourseFormTabs from "./CourseFormTabs";
import BasicInfoForm from "./BasicInfoForm";
import CourseMetadataFields from "./CourseMetadataFields";
import ThumbnailUploader from "./ThumbnailUploader";
import PublishingPanel from "./PublishingPanel";
import CourseFormActionBar from "./CourseFormActionBar";
import CourseStructurePage from "./CourseStructurePage";
import { tutorProfile } from "../../data/tutorDashboardData";
import {
  createTutorCourse,
  getTutorCourse,
  toEditorFormData,
  toPublishingState,
  updateTutorCourse,
} from "../../api/courseApi";
import {
  validateField,
  validateCourseForm,
} from "../../utils/courseFormValidation";

const INITIAL_FORM = {
  title: "",
  summary: "",
  category: "",
  level: "",
  duration: "",
  price: "",
  thumbnail: null,
};

export default function EditCoursePage({ onBack }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId");

  const [activeTab, setActiveTab] = useState("basic");
  const [sidebarPage, setSidebarPage] = useState("courses");
  const [lastSaved, setLastSaved] = useState(null);

  const [courseId, setCourseId] = useState(
    initialCourseId ? Number(initialCourseId) : null,
  );
  const [loadingCourse, setLoadingCourse] = useState(!!initialCourseId);
  const [savingCourse, setSavingCourse] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [publishing, setPublishing] = useState({
    status: "DRAFT",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!initialCourseId) {
        setLoadingCourse(false);
        return;
      }

      setLoadingCourse(true);
      setLoadError("");
      try {
        const data = await getTutorCourse(initialCourseId);
        setCourseId(data.id);
        setFormData(toEditorFormData(data));
        setPublishing(toPublishingState(data));
      } catch (error) {
        console.error("Failed to load course:", error);
        setLoadError(
          error?.response?.data?.error ||
            "Could not load this course. Please try again.",
        );
      } finally {
        setLoadingCourse(false);
      }
    };

    loadCourse();
  }, [initialCourseId]);

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

  const handlePublishingChange = (field, value) => {
    setPublishing((prev) => ({ ...prev, [field]: value }));
  };

  const getPayload = () => ({
    title: formData.title,
    summary: formData.summary,
    category: formData.category,
    level: formData.level,
    duration_hours: formData.duration,
    price: formData.price,
    thumbnail: formData.thumbnail || undefined,
    status: publishing.status,
  });

  const handleSubmit = async () => {
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

    setSavingCourse(true);
    try {
      const payload = getPayload();
      const response = courseId
        ? await updateTutorCourse(courseId, payload, true)
        : await createTutorCourse(payload);

      if (!courseId && response?.id) {
        setCourseId(response.id);
        setSearchParams({ courseId: String(response.id) });
      }

      const now = new Date();
      setLastSaved(
        `Last saved: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      );
      alert(
        courseId
          ? "✅ Course updated successfully!"
          : "✅ Course created successfully!",
      );
    } catch (error) {
      console.error("Failed to save course:", error);
      alert(
        JSON.stringify(
          error?.response?.data || "Failed to save course. Please try again.",
        ),
      );
    } finally {
      setSavingCourse(false);
    }
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
        onLogout={() => navigate("/")}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 pt-7 pb-4">
            <CourseFormTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {loadingCourse && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-600 mb-6">
                Loading course details...
              </div>
            )}

            {!loadingCourse && loadError && (
              <div className="bg-red-50 text-red-700 rounded-2xl border border-red-100 p-6 text-sm mb-6">
                {loadError}
              </div>
            )}

            {!loadingCourse && activeTab === "basic" && (
              <div className="flex gap-7">
                <div className="flex-1 min-w-0 flex flex-col gap-8">
                  <BasicInfoForm
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <CourseMetadataFields
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="w-64 flex-shrink-0 flex flex-col gap-5">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <ThumbnailUploader onFileChange={handleThumbnailChange} />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <PublishingPanel
                      value={publishing}
                      onChange={handlePublishingChange}
                      disabled={savingCourse}
                    />
                  </div>
                </div>
              </div>
            )}

            {!loadingCourse && activeTab === "structure" && !courseId && (
              <div className="bg-white rounded-2xl border border-gray-100 p-7 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Save basic info first
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  Create the course once to unlock chapter and lesson
                  management.
                </p>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-2.5 px-5"
                >
                  Save and Continue
                </button>
              </div>
            )}

            {!loadingCourse && activeTab === "structure" && courseId && (
              <CourseStructurePage
                courseId={courseId}
                courseName={formData.title || "Untitled Course"}
                onBack={() => setActiveTab("basic")}
              />
            )}
          </div>
        </div>

        <CourseFormActionBar
          lastSaved={lastSaved}
          errorCount={errorCount}
          onDiscard={handleDiscard}
          onSubmit={handleSubmit}
          submitLabel={courseId ? "Update Course" : "Create Course"}
          submitting={savingCourse}
        />
      </div>
    </div>
  );
}
