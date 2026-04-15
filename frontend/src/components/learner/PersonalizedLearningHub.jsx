import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LearnerTopNav from "./LearnerTopNav";
import { mockStudent } from "../../data/mockCourses";
import { Target, Crown, Zap, TrendingUp } from "lucide-react";
import {
  getCourseProgress,
  getPublishedCourseDetail,
  getStudentProfile,
  toLearnerStudentProfile,
  toLessonRowsFromCourseDetail,
} from "../../api/courseApi";

export default function PersonalizedLearningHub() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(mockStudent);
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  const enrolledCourse = course;

  const hydrateCourse = async () => {
    const [detail, progress, profileData] = await Promise.all([
      getPublishedCourseDetail(courseId),
      getCourseProgress(courseId),
      getStudentProfile(),
    ]);

    setCourse(detail);
    setProgressData(progress);
    const mappedLessons = toLessonRowsFromCourseDetail(detail).map(
      (lesson) => ({
        ...lesson,
        isCompleted: progress.completed_lesson_ids.includes(lesson.id),
        isUnlocked:
          progress.completed_lesson_ids.includes(lesson.id) ||
          progress.earned_credits >= lesson.requiredCreditsToUnlock,
      }),
    );
    setLessons(mappedLessons);

    const resolvedProfile = toLearnerStudentProfile(profileData, mockStudent);
    setStudent({
      ...resolvedProfile,
      earnedCredits: progress.earned_credits,
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await hydrateCourse();
      } catch (error) {
        console.error("Failed to load learning hub data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  const handleStartLesson = (lesson) => {
    if (!lesson?.id) return;
    if (lesson.isUnlocked === false) {
      alert("This lesson is still locked.");
      return;
    }

    navigate(`/learning/${courseId}/lesson/${lesson.id}`);
  };

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const totalCount = lessons.length;
  const courseProgress = Math.round((completedCount / totalCount) * 100);
  const creditsToTarget = Math.max(150 - student.earnedCredits, 0);

  const recommendedLessons = useMemo(
    () =>
      lessons
        .filter((lesson) => !lesson.isCompleted)
        .slice(0, 3)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          credits: lesson.creditsAwarded,
          impact: lesson.requiredCreditsToUnlock > 0 ? "High" : "Medium",
        })),
    [lessons],
  );

  const levels = [
    { label: "A1", status: "active" },
    { label: "A2", status: "target" },
    { label: "B1", status: "future" },
    { label: "B2", status: "future" },
    { label: "C1", status: "future" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LearnerTopNav />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && (
          <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-500">
            Loading learning progress...
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2 bg-white rounded-lg text-blue-600 font-medium hover:bg-gray-100 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl px-6 py-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold">
                VU
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Academic Vocabulary Builder
                </h2>
                <p className="text-sm text-gray-500">{enrolledCourse?.title}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl px-6 py-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {(student.name || "S").charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-600">{student.level}</p>
                <p className="text-xs text-gray-500">{student.selectedArea}</p>
              </div>
            </div>
            <div className="bg-white rounded-full px-4 py-2 border-2 border-yellow-400 text-center">
              <p className="text-xs font-bold text-yellow-600">Top 10%</p>
              <p className="text-xs text-gray-600">This Week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <h3 className="text-center font-bold text-lg text-gray-900 mb-8">
            Your Learning Bridge
          </h3>

          <div className="flex items-center justify-between gap-8">
            <div className="flex flex-col items-center flex-1">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-cyan-300 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white shadow-lg">
                  <div className="text-center">
                    <p className="text-xs font-bold text-white">Current</p>
                    <p className="text-xl font-bold text-white">A1</p>
                  </div>
                </div>
              </div>
              <p className="font-semibold text-gray-900">Beginner</p>
              <p className="text-sm text-gray-600 text-center mt-1">
                {student.earnedCredits} credits earned
              </p>
            </div>

            <div className="flex-2 flex flex-col items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {creditsToTarget}
                </div>
                <p className="text-sm text-gray-600">Credits to Bridge</p>
              </div>
              <div className="w-32 h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-yellow-400 rounded-full shadow-md"></div>
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-20"></div>
                <div className="relative bg-gradient-to-br from-yellow-300 to-yellow-200 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white shadow-lg opacity-60">
                  <div className="text-center">
                    <p className="text-xs font-bold text-yellow-800">Target</p>
                    <p className="text-xl font-bold text-yellow-800">A2</p>
                  </div>
                </div>
              </div>
              <p className="font-semibold text-gray-900">Intermediate</p>
              <p className="text-sm text-gray-600 text-center mt-1">
                150 credits needed
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Recommended for Your A2 Goal
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {recommendedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                  +{lesson.credits} Credits
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-sm">
                  {lesson.title}
                </h4>
                <p className="text-xs text-gray-600 mb-4">System Recommended</p>
                <button
                  onClick={() =>
                    handleStartLesson({
                      id: lesson.id,
                      title: lesson.title,
                      creditsAwarded: lesson.credits,
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Start Lesson →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              All Lessons
            </h3>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {lesson.title}
                      </h4>
                      {lesson.isCompleted && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          ✓ Complete
                        </span>
                      )}
                      {!lesson.isUnlocked && (
                        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {lesson.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📚 {lesson.duration} min</span>
                      <span>⭐ +{lesson.creditsAwarded} credits</span>
                    </div>
                  </div>
                  {!lesson.isCompleted && lesson.isUnlocked && (
                    <button
                      onClick={() => handleStartLesson(lesson)}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <h4 className="font-bold text-gray-900 text-center mb-4">
                Daily Goal
              </h4>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(courseProgress / 100) * 251.2} 251.2`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {courseProgress}%
                    </p>
                    <p className="text-xs text-gray-600">Progress</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                {completedCount}/{totalCount} lessons
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <h4 className="font-bold text-gray-900 mb-4">Credit Vault</h4>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-blue-600 animate-pulse">
                    {progressData?.earned_credits ?? student.earnedCredits}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-xs text-gray-600 mb-1">To Next Level</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {creditsToTarget}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <h4 className="font-bold text-gray-900 mb-4">Your Journey</h4>
              <div className="space-y-2">
                {levels.map((level, idx) => (
                  <div
                    key={level.label}
                    className={`p-3 rounded-lg text-center font-semibold text-sm transition-all ${
                      level.status === "active"
                        ? "bg-cyan-100 text-cyan-700 border-2 border-cyan-400"
                        : level.status === "completed"
                          ? "bg-green-50 text-green-600 opacity-100"
                          : level.status === "target"
                            ? "bg-yellow-50 text-yellow-600 opacity-60"
                            : "bg-gray-50 text-gray-400 opacity-40"
                    }`}
                  >
                    {level.label}
                    {level.status === "active" && " ← Active"}
                    {level.status === "target" && " ← Target"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
