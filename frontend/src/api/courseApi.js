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

export function levelToLabel(level) {
  return LEVEL_LABELS[level] || level || "Beginner";
}

export function statusToLabel(status) {
  return STATUS_LABELS[status] || status || "Draft";
}

export function toEditorFormData(course) {
  return {
    title: course?.title || "",
    slug: course?.slug || "",
    summary: course?.summary || "",
    description: course?.description || "",
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
    publicMarketplace:
      typeof course?.public_marketplace === "boolean"
        ? course.public_marketplace
        : true,
    searchIndexing: !!course?.search_indexing,
    autoEnroll:
      typeof course?.auto_enroll_existing_students === "boolean"
        ? course.auto_enroll_existing_students
        : false,
  };
}

export function toTutorCourseCard(course) {
  return {
    id: course.id,
    title: course.title,
    description: course.summary || course.description || "",
    status: statusToLabel(course.status),
    totalLessons: course.totalLessons || 0,
    thumbnailLabel: (course.category || "Course").replace(/-/g, " "),
    thumbnailBg: toCourseCardGradient(course.id),
    thumbnailAccent: "text-slate-200",
  };
}

export function toLearnerCourseCard(course) {
  return {
    id: course.id,
    title: course.title,
    instructor: course.instructor || "English Tutor",
    level: levelToLabel(course.level),
    rating: Number(course.rating || 4.8).toFixed(1),
    focusArea: (course.focusArea || course.category || "General").replace(
      /-/g,
      " ",
    ),
    totalLessons: course.totalLessons || 0,
    durationWeeks: course.durationWeeks || 1,
    requiredCredits: 0,
    description: course.summary || course.description || "",
    thumbnail: course.thumbnail || null,
  };
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

export async function getTutorCourse(courseId) {
  const { data } = await privateApi.get(`tutor/courses/${courseId}/`);
  return data;
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
