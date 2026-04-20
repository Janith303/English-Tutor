import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
import LearnerTopNav from "./LearnerTopNav";
import {
  createEnrollment,
  getPublishedCourses,
  getPublishedCourseDetail,
  toLearnerCourseCard,
  toLessonRowsFromCourseDetail,
} from "../../api/courseApi";

const TutorDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const data = await getPublishedCourseDetail(courseId);
        setCourse(data);
        setCourseLessons(toLessonRowsFromCourseDetail(data));

        const publishedCourses = await getPublishedCourses();
        const currentCourseId = Number(courseId);

        const filtered = (
          Array.isArray(publishedCourses) ? publishedCourses : []
        )
          .filter((item) => Number(item?.id) !== currentCourseId)
          .filter((item) => {
            if (!data?.category) return true;
            return (
              String(item?.category || "").toLowerCase() ===
              String(data.category).toLowerCase()
            );
          });

        const picked = (filtered.length ? filtered : publishedCourses || [])
          .filter((item) => Number(item?.id) !== currentCourseId)
          .slice(0, 3)
          .map((item) => toLearnerCourseCard(item));

        setRelatedCourses(picked);
      } catch (error) {
        console.error("Failed to load course detail:", error);
        setCourse(null);
        setCourseLessons([]);
        setRelatedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const lessonCount = courseLessons.length;
  const totalMinutes = courseLessons.reduce(
    (sum, lesson) => sum + Number(lesson.duration || 0),
    0,
  );
  const enrolledStudents = Number(course?.enrolledStudents || 0);
  const tutorName = course?.instructor || "English Tutor";
  const levelLabel = course?.level
    ? `${String(course.level).charAt(0).toUpperCase()}${String(course.level).slice(1)}`
    : "Beginner";

  const lessonsByChapter = courseLessons.reduce((acc, lesson) => {
    const chapterId = lesson.chapterId ?? "uncategorized";
    const chapterTitle = lesson.chapterTitle || "Untitled Chapter";
    const chapterOrder = lesson.chapterOrder ?? Number.MAX_SAFE_INTEGER;

    if (!acc[chapterId]) {
      acc[chapterId] = {
        chapterId,
        chapterTitle,
        chapterOrder,
        lessons: [],
      };
    }

    acc[chapterId].lessons.push(lesson);
    return acc;
  }, {});
  const orderedChapters = Object.values(lessonsByChapter)
    .map((chapter) => ({
      ...chapter,
      lessons: [...chapter.lessons].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      ),
    }))
    .sort((a, b) => a.chapterOrder - b.chapterOrder);

  // Dynamically generate skills based on course data
  const getSkillsForCourse = () => {
    const baseSkills = [
      `${course?.category || "Subject"} Fundamentals`,
      "Practical Applications",
      "Best Practices & Patterns",
    ];

    if (
      course?.level?.toLowerCase() === "advanced" ||
      course?.level?.toLowerCase() === "intermediate"
    ) {
      baseSkills.push("Advanced Techniques", "Real-world Problem Solving");
    } else {
      baseSkills.push("Hands-on Exercises", "Project-based Learning");
    }

    return baseSkills;
  };

  // Dynamically generate audience based on course level
  const getAudienceForCourse = () => {
    const baseAudience = ["Beginners", "Students"];

    if (
      course?.level?.toLowerCase() === "intermediate" ||
      course?.level?.toLowerCase() === "advanced"
    ) {
      baseAudience.push("Professionals", "Career Switchers");
    } else {
      baseAudience.push("Self-learners", "Career Switchers");
    }

    if (course?.level?.toLowerCase() === "advanced") {
      baseAudience.push("Tech Enthusiasts", "Experts");
    } else {
      baseAudience.push("Tech Enthusiasts");
    }

    return baseAudience;
  };

  const handleEnroll = async () => {
    if (!course?.id) return;

    try {
      await createEnrollment(course.id);
      navigate(`/learning/${course.id}`);
    } catch (error) {
      if (error?.response?.status === 400) {
        navigate(`/learning/${course.id}`);
        return;
      }
      alert("Enrollment failed. Please try again.");
    }
  };

  const resolveMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LearnerTopNav />
      <div className="flex-1 w-full">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-500">
            Loading course details...
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200 py-8">
              <div className="max-w-6xl mx-auto px-6">
                {/* Course Info */}
                <div>
                  {/* Badge & Rating */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-green-50 text-green-600 text-xs px-3 py-1 rounded border border-green-200 font-semibold">
                      Free Course
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className="text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 ml-1">
                        4.5
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {course?.title || "Course Title"}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <span className="font-medium">
                      {enrolledStudents} Learners Enrolled
                    </span>
                    <span>•</span>
                    <span className="font-medium">{levelLabel} Level</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                    {course?.summary ||
                      "Learn the fundamentals of this course from scratch. This beginner-friendly course covers core concepts and practical applications to help you get started."}
                  </p>

                  {/* Instructor */}
                  <div className="text-sm text-gray-600">
                    with{" "}
                    <span className="font-semibold text-gray-900">
                      {tutorName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="max-w-6xl mx-auto px-6 py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🎯 {course?.title} - Key Topics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {getSkillsForCourse().map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle
                      size={20}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <span className="text-gray-700 font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Who Should Learn Section */}
            <div className="py-12 border-y border-gray-200">
              <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Who should learn this course?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getAudienceForCourse().map((audience, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 rounded-lg px-3 py-2 bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {audience}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Curriculum Section */}
            <div className="max-w-6xl mx-auto px-6 py-12 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What you will learn in this course?
              </h2>

              {courseLessons.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center border border-dashed border-gray-300">
                  <MessageSquare
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-gray-500 font-medium">No lessons yet</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Lessons will appear once the tutor publishes chapters.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course?.title || "Course"}
                    </h3>
                  </div>

                  {/* Lessons by Chapter */}
                  <div className="space-y-4">
                    {orderedChapters.map((chapter, chapterIdx) => (
                      <div
                        key={chapter.chapterId}
                        className="bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="px-4 py-3 border-b border-blue-100 bg-blue-50 rounded-t-lg">
                          <p className="text-sm font-semibold text-gray-800">
                            Chapter {chapterIdx + 1}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {chapter.lessons.length} lessons
                          </p>
                        </div>

                        <div className="p-3 space-y-2">
                          {chapter.lessons.map((lesson, idx) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-700 font-medium text-sm">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {lesson.duration || 10} min · +
                                  {lesson.creditsAwarded || 0} credits
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Courses Section */}
            <div className="max-w-6xl mx-auto px-6 pb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Related Courses
              </h2>

              {relatedCourses.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-500">
                  No related courses available right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedCourses.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => navigate(`/course/${related.id}`)}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      {related.thumbnail ? (
                        <img
                          src={resolveMediaUrl(related.thumbnail)}
                          alt={related.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-slate-700 to-slate-900 flex items-end p-3">
                          <p className="text-slate-200 text-xs font-semibold uppercase tracking-wide">
                            {(related.focusArea || "Course").slice(0, 18)}
                          </p>
                        </div>
                      )}

                      <div className="p-4">
                        <p className="text-xs text-gray-500">{related.level}</p>
                        <h3
                          className="mt-1 text-xl font-semibold text-gray-800 leading-snug overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: "3.15rem",
                          }}
                        >
                          {related.title}
                        </h3>
                        <p className="mt-2 text-xs text-gray-500">
                          {related.rating} ★ • {related.enrolledStudents}{" "}
                          Learners • {related.durationWeeks} wks
                        </p>
                        <p className="mt-1 text-xs text-gray-600 truncate">
                          by {related.instructor}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {related.totalLessons} lessons
                        </p>
                        <p className="mt-2 text-green-600 font-semibold text-sm">
                          FREE
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorDetailsPage;
