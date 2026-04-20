import privateApi from "./axios";

const LEVEL_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const STATUS_LABELS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const COURSE_CARD_GRADIENTS = [
  "from-gray-700 to-gray-900",
  "from-teal-700 to-teal-900",
  "from-blue-700 to-blue-900",
  "from-indigo-700 to-indigo-900",
  "from-cyan-700 to-cyan-900",
  "from-slate-700 to-slate-900",
];

const AREA_KEYWORD_MAP = {
  "academic writing": ["academic", "writing", "essay", "research"],
  "presentation skills": ["presentation", "public", "speaking"],
  "interview prep": ["interview", "job", "career"],
  "grammar flow": ["grammar", "sentence", "structure", "flow"],
  vocabulary: ["vocabulary", "word", "lexicon"],
};

function isFile(value) {
  return typeof File !== "undefined" && value instanceof File;
}

function buildFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
      return;
    }
    formData.append(key, value);
  });
  return formData;
}

function toCourseCardGradient(id) {
  const index = Number(id || 0) % COURSE_CARD_GRADIENTS.length;
  return COURSE_CARD_GRADIENTS[index];
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function courseMatchesSelectedArea(course, selectedArea) {
  const area = normalizeText(selectedArea);
  if (!area) return true;

  const courseText = normalizeText(
    `${course?.focusArea || ""} ${course?.title || ""} ${course?.description || ""}`,
  );

  if (!courseText) return false;
  if (courseText.includes(area)) return true;

  const keywords =
    AREA_KEYWORD_MAP[area] || area.split(" ").filter((word) => word.length > 2);

  return keywords.some((keyword) => courseText.includes(keyword));
}

export function toLearnerStudentProfile(profile, fallback = {}) {
  const safeFallback = fallback || {};

  const resolvedName =
    profile?.full_name ||
    safeFallback.fullName ||
    safeFallback.name ||
    "Student";

  const resolvedArea =
    profile?.selected_area ||
    profile?.selected_areas?.[0] ||
    safeFallback.selectedArea ||
    "General English";

  const resolvedLevel =
    profile?.level ||
    profile?.placement_level ||
    profile?.target_level ||
    safeFallback.level ||
    "Beginner";

  return {
    ...safeFallback,
    fullName: resolvedName,
    name: resolvedName,
    selectedArea: resolvedArea,
    level: resolvedLevel,
    proficiencyLevel: resolvedLevel,
  };
}

function toDisplayTutorName(rawInstructor) {
  if (!rawInstructor) return "English Tutor";

  const value = String(rawInstructor).trim();
  if (!value) return "English Tutor";

  // If backend fallback sends an email, extract and humanize the local-part.
  if (value.includes("@")) {
    const localPart = value.split("@")[0] || "";
    const cleaned = localPart.replace(/[._-]+/g, " ").trim();
    if (!cleaned) return "English Tutor";

    return cleaned
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  return value;
}

export function levelToLabel(level) {
  return LEVEL_LABELS[level] || level || "Beginner";
}

export function statusToLabel(status) {
  return STATUS_LABELS[status] || status || "Draft";
}

export function toEditorFormData(course) {
  return {
    title: course?.title || "",
    summary: course?.summary || "",
    category: course?.category || "",
    level: course?.level || "",
    duration: String(course?.duration_hours || ""),
    price: String(course?.price || ""),
    thumbnail: null,
  };
}

export function toPublishingState(course) {
  return {
    status: course?.status || "DRAFT",
  };
}

export function toTutorCourseCard(course) {
  return {
    id: course.id,
    title: course.title,
    description: course.summary || "",
    status: statusToLabel(course.status),
    totalLessons: course.totalLessons || 0,
    thumbnail: course.thumbnail || null,
    thumbnailLabel: (course.category || "Course").replace(/-/g, " "),
    thumbnailBg: toCourseCardGradient(course.id),
    thumbnailAccent: "text-slate-200",
  };
}

export function toLearnerCourseCard(course) {
  const lessonCount = Number(course.totalLessons || 0);
  const durationWeeks = Number(course.durationWeeks || 1);
  const baseRating = 4.2 + Math.min(lessonCount, 20) / 25;
  const enrolledStudents = Number(course.enrolledStudents || 0);
  const reviewsCount = Math.max(8, lessonCount * durationWeeks + 4);

  return {
    id: course.id,
    title: course.title,
    instructor: toDisplayTutorName(course.instructor),
    level: levelToLabel(course.level),
    rating: Number(course.rating || baseRating).toFixed(1),
    reviews: course.reviews || `${reviewsCount}`,
    enrolledStudents,
    focusArea: (course.focusArea || course.category || "General").replace(
      /-/g,
      " ",
    ),
    totalLessons: lessonCount,
    durationWeeks,
    requiredCredits: 0,
    description: course.summary || "",
    thumbnail: course.thumbnail || null,
  };
}

export function filterCoursesForStudentPreferences(courses, student) {
  const source = Array.isArray(courses) ? courses : [];
  const level = normalizeText(student?.level);
  const selectedArea = student?.selectedArea;

  const byLevel = level
    ? source.filter((course) => normalizeText(course?.level) === level)
    : source;

  return byLevel.filter((course) =>
    courseMatchesSelectedArea(course, selectedArea),
  );
}

export function toLessonRowsFromCourseDetail(course) {
  const lessons = [];

  (course?.chapters || []).forEach((chapter) => {
    (chapter.lessons || []).forEach((lesson) => {
      lessons.push({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration_minutes,
        creditsAwarded: lesson.credits_awarded,
        requiredCreditsToUnlock: lesson.required_credits_to_unlock,
        isCompleted: !!lesson.is_completed,
        isUnlocked: !!lesson.is_unlocked,
        description: chapter.title,
        // New: Chapter metadata for grouping in right panel
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterOrder: chapter.order,
        // New: Snake_case variants for 3-panel layout
        duration_minutes: lesson.duration_minutes,
        credits_awarded: lesson.credits_awarded,
        required_credits_to_unlock: lesson.required_credits_to_unlock,
        is_completed: !!lesson.is_completed,
        is_unlocked: !!lesson.is_unlocked,
      });
    });
  });

  return lessons.sort((a, b) => a.order - b.order);
}

export function toMyLearningCard(enrollment) {
  const completedDate = enrollment.completed_at
    ? new Date(enrollment.completed_at).toLocaleDateString()
    : null;
  const isFree =
    enrollment?.course?.price === "0.00" ||
    Number(enrollment?.course?.price) === 0;

  return {
    id: enrollment.course.id,
    title: enrollment.course.title,
    provider: enrollment.course.instructor || "English Tutor",
    type: isFree ? "Free Course" : "Paid Course",
    progress: enrollment.progress,
    status: enrollment.status,
    expiresInDays: enrollment.status === "in_progress" ? 10 : null,
    completedDate,
  };
}

export async function getTutorCourses() {
  const { data } = await privateApi.get("tutor/courses/");
  return data;
}

function toSafeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildFallbackEnrollmentTrend(days = 30) {
  return Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    enrollments: 0,
    date: null,
  }));
}

export async function getTutorDashboardOverview() {
  const { data } = await privateApi.get("tutor/dashboard/");

  const stats = {
    total_signups: toSafeNumber(data?.stats?.total_signups),
    total_learners: toSafeNumber(data?.stats?.total_learners),
    total_courses: toSafeNumber(data?.stats?.total_courses),
    total_lessons: toSafeNumber(data?.stats?.total_lessons),
  };

  const trendSource = Array.isArray(data?.enrollment_trend)
    ? data.enrollment_trend
    : buildFallbackEnrollmentTrend();

  const enrollmentTrend = trendSource.map((point, index) => ({
    day: toSafeNumber(point?.day) || index + 1,
    enrollments: toSafeNumber(point?.enrollments),
    date: point?.date || null,
  }));

  return {
    stats,
    enrollmentTrend,
  };
}

export async function getTutorDashboardStats() {
  const overview = await getTutorDashboardOverview();
  return overview.stats;
}

export async function getTutorCourse(courseId) {
  const { data } = await privateApi.get(`tutor/courses/${courseId}/`);
  return data;
}

export async function deleteTutorCourse(courseId) {
  await privateApi.delete(`tutor/courses/${courseId}/`);
}

export async function createTutorCourse(payload) {
  const hasBinary = isFile(payload?.thumbnail);
  if (hasBinary) {
    const { data } = await privateApi.post(
      "tutor/courses/",
      buildFormData(payload),
    );
    return data;
  }

  const { data } = await privateApi.post("tutor/courses/", payload);
  return data;
}

export async function updateTutorCourse(courseId, payload, partial = true) {
  const hasBinary = isFile(payload?.thumbnail);
  const method = partial ? "patch" : "put";

  if (hasBinary) {
    const { data } = await privateApi[method](
      `tutor/courses/${courseId}/`,
      buildFormData(payload),
    );
    return data;
  }

  const { data } = await privateApi[method](
    `tutor/courses/${courseId}/`,
    payload,
  );
  return data;
}

export async function updateTutorPublishing(courseId, payload) {
  const { data } = await privateApi.patch(
    `tutor/courses/${courseId}/publish/`,
    payload,
  );
  return data;
}

export async function getTutorChapters(courseId) {
  const { data } = await privateApi.get(`tutor/courses/${courseId}/chapters/`);
  return data;
}

export async function createTutorChapter(courseId, payload) {
  const { data } = await privateApi.post(
    `tutor/courses/${courseId}/chapters/`,
    payload,
  );
  return data;
}

export async function updateTutorChapter(courseId, chapterId, payload) {
  const { data } = await privateApi.patch(
    `tutor/courses/${courseId}/chapters/${chapterId}/`,
    payload,
  );
  return data;
}

export async function deleteTutorChapter(courseId, chapterId) {
  await privateApi.delete(`tutor/courses/${courseId}/chapters/${chapterId}/`);
}

export async function createTutorLesson(chapterId, payload) {
  const { data } = await privateApi.post(
    `tutor/chapters/${chapterId}/lessons/`,
    payload,
  );
  return data;
}

export async function updateTutorLesson(chapterId, lessonId, payload) {
  const { data } = await privateApi.patch(
    `tutor/chapters/${chapterId}/lessons/${lessonId}/`,
    payload,
  );
  return data;
}

export async function deleteTutorLesson(chapterId, lessonId) {
  await privateApi.delete(`tutor/chapters/${chapterId}/lessons/${lessonId}/`);
}

export async function getPublishedCourses() {
  const { data } = await privateApi.get("courses/");
  return data;
}

export async function getStudentProfile() {
  const { data } = await privateApi.get("students/profile/");
  return data;
}

export async function getPublishedCourseDetail(courseId) {
  const { data } = await privateApi.get(`courses/${courseId}/`);
  return data;
}

export async function createEnrollment(courseId) {
  const { data } = await privateApi.post("students/enrollments/", {
    course_id: courseId,
  });
  return data;
}

export async function getStudentEnrollments() {
  const { data } = await privateApi.get("students/enrollments/");
  return data;
}

export async function completeCourseLesson(courseId, lessonId) {
  const { data } = await privateApi.post(
    `students/courses/${courseId}/lessons/${lessonId}/complete/`,
    {},
  );
  return data;
}

export async function getCourseProgress(courseId) {
  const { data } = await privateApi.get(
    `students/courses/${courseId}/progress/`,
  );
  return data;
}

// --- LESSON AUTHORING + LESSON READER API ---
export async function getTutorLessonAuthoring(chapterId, lessonId) {
  const { data } = await privateApi.get(
    `tutor/chapters/${chapterId}/lessons/${lessonId}/authoring/`,
  );
  return data;
}

export async function updateTutorLessonAuthoring(chapterId, lessonId, payload) {
  const hasBinary =
    isFile(payload?.lesson_image) || isFile(payload?.lesson_video_file);

  if (hasBinary) {
    const { data } = await privateApi.patch(
      `tutor/chapters/${chapterId}/lessons/${lessonId}/authoring/`,
      buildFormData(payload),
    );
    return data;
  }

  const { data } = await privateApi.patch(
    `tutor/chapters/${chapterId}/lessons/${lessonId}/authoring/`,
    payload,
  );
  return data;
}

export async function getTutorLessonFiles(lessonId) {
  const { data } = await privateApi.get(`tutor/lessons/${lessonId}/files/`);
  return data;
}

export async function uploadTutorLessonFile(lessonId, payload) {
  const { data } = await privateApi.post(
    `tutor/lessons/${lessonId}/files/`,
    buildFormData(payload),
  );
  return data;
}

export async function updateTutorLessonFile(lessonId, fileId, payload) {
  const { data } = await privateApi.patch(
    `tutor/lessons/${lessonId}/files/${fileId}/`,
    payload,
  );
  return data;
}

export async function deleteTutorLessonFile(lessonId, fileId) {
  await privateApi.delete(`tutor/lessons/${lessonId}/files/${fileId}/`);
}

export async function getTutorLessonQuizzes(lessonId) {
  const { data } = await privateApi.get(`tutor/lessons/${lessonId}/quizzes/`);
  return data;
}

export async function createTutorLessonQuiz(lessonId, payload) {
  const { data } = await privateApi.post(
    `tutor/lessons/${lessonId}/quizzes/`,
    payload,
  );
  return data;
}

export async function updateTutorLessonQuiz(lessonId, quizId, payload) {
  const { data } = await privateApi.patch(
    `tutor/lessons/${lessonId}/quizzes/${quizId}/`,
    payload,
  );
  return data;
}

export async function deleteTutorLessonQuiz(lessonId, quizId) {
  await privateApi.delete(`tutor/lessons/${lessonId}/quizzes/${quizId}/`);
}

export async function getStudentLessonDetail(courseId, lessonId) {
  const { data } = await privateApi.get(
    `students/courses/${courseId}/lessons/${lessonId}/`,
  );
  return data;
}

export async function submitStudentLessonQuiz(
  courseId,
  lessonId,
  quizId,
  payload,
) {
  const { data } = await privateApi.post(
    `students/courses/${courseId}/lessons/${lessonId}/quizzes/${quizId}/submit/`,
    payload,
  );
  return data;
}

export async function completeStudentLessonChecked(courseId, lessonId) {
  const { data } = await privateApi.post(
    `students/courses/${courseId}/lessons/${lessonId}/complete-checked/`,
    {},
  );
  return data;
}

// --- STUDENT NOTES API ---
export async function createStudentNote(courseId, payload) {
  // TODO: Replace with actual backend endpoint when available
  // For now, using localStorage mock
  const notes = JSON.parse(localStorage.getItem(`notes_${courseId}`) || "[]");
  const newNote = {
    id: Date.now(),
    courseId,
    lessonId: payload.lessonId || null,
    title: payload.title,
    description: payload.description,
    context: payload.context, // "lesson" or "course"
    createdAt: new Date().toISOString(),
  };
  notes.push(newNote);
  localStorage.setItem(`notes_${courseId}`, JSON.stringify(notes));
  return newNote;
}

export async function getStudentNotes(courseId, filters = {}) {
  // TODO: Replace with actual backend endpoint when available
  const notes = JSON.parse(localStorage.getItem(`notes_${courseId}`) || "[]");

  if (filters.lessonId && filters.context === "lesson") {
    return notes.filter(
      (note) => note.lessonId === filters.lessonId && note.context === "lesson",
    );
  }

  if (!filters.lessonId && Object.keys(filters).length === 0) {
    return notes;
  }

  return notes;
}

export async function deleteStudentNote(courseId, noteId) {
  // TODO: Replace with actual backend endpoint when available
  const notes = JSON.parse(localStorage.getItem(`notes_${courseId}`) || "[]");
  const filtered = notes.filter((note) => note.id !== noteId);
  localStorage.setItem(`notes_${courseId}`, JSON.stringify(filtered));
}
