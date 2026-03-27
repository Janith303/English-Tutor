import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LearnerTopNav from "./LearnerTopNav";
import CreditProgressPanel from "./CreditProgressPanel";
import LessonTrackerList from "./LessonTrackerList";
import { mockStudent, mockLessons, mockCourses } from "../../data/mockCourses";

export default function PersonalizedLearningHub() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(mockStudent);
  const [lessons, setLessons] = useState(mockLessons);

  // Find the enrolled course from mockCourses
  const enrolledCourse = mockCourses.find((c) => c.id === parseInt(courseId));

  const handleStartLesson = (lesson) => {
    const confirm = window.confirm(
      `Mark "${lesson.title}" as complete and earn ${lesson.creditsAwarded} credits?`,
    );
    if (!confirm) return;

    const newCredits = student.earnedCredits + lesson.creditsAwarded;
    setStudent((prev) => ({ ...prev, earnedCredits: newCredits }));
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id === lesson.id) return { ...l, isCompleted: true };
        if (!l.isUnlocked && l.requiredCreditsToUnlock <= newCredits)
          return { ...l, isUnlocked: true };
        return l;
      }),
    );
  };

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const totalCount = lessons.length;
  const courseProgress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LearnerTopNav student={student} />
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-1"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {enrolledCourse?.title || "My Learning"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {enrolledCourse?.instructor} · {enrolledCourse?.level}
            </p>
          </div>

          {/* Progress pill */}
          <div className="hidden md:flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeDasharray={`${courseProgress} ${100 - courseProgress}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">
                {courseProgress}%
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Course Progress</p>
              <p className="text-sm font-semibold text-gray-800">
                {completedCount}/{totalCount} lessons done
              </p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LessonTrackerList
              lessons={lessons}
              earnedCredits={student.earnedCredits}
              onStartLesson={handleStartLesson}
            />
          </div>
          <div className="flex flex-col gap-5">
            <CreditProgressPanel student={student} />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <h3 className="font-bold text-gray-900 mb-3 text-base">
                Course Info
              </h3>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Focus Area</span>
                  <span className="text-gray-700 font-medium">
                    {enrolledCourse?.focusArea}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-gray-700 font-medium">
                    {enrolledCourse?.durationWeeks} weeks
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Lessons</span>
                  <span className="text-gray-700 font-medium">
                    {enrolledCourse?.totalLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Level</span>
                  <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {student.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
