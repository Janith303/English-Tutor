import { useEffect, useMemo, useState } from "react";
import LearnerTopNav from "../learner/LearnerTopNav";
import { useNavigate } from "react-router-dom";
import CourseProgressCard from "./CourseProgressCard";
import CourseSearchFilter from "./CourseSearchFilter";
import LearningStatsPanel from "./LearningStatsPanel";
import SidebarRecommendations from "./SidebarRecommendations";
import WeekSchedulePanel from "./WeekSchedulePanel";
import {
  enrolledCourses,
  learningProgress,
  recommendedCourses,
} from "../../data/myLearningData";
import { mockStudent } from "../../data/mockCourses";
import {
  getPublishedCourses,
  getStudentEnrollments,
  toLearnerCourseCard,
  toMyLearningCard,
} from "../../api/courseApi";

export default function MyLearningPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [recommended, setRecommended] = useState(recommendedCourses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [enrollments, published] = await Promise.all([
          getStudentEnrollments(),
          getPublishedCourses(),
        ]);

        setCourses((enrollments || []).map(toMyLearningCard));
        setRecommended((published || []).slice(0, 3).map(toLearnerCourseCard));
      } catch (error) {
        console.error("Failed to load my learning data:", error);
        setCourses(enrolledCourses);
        setRecommended(recommendedCourses);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const inProgressCourses = courses.filter((c) => c.status === "in_progress");
  const completedCourses = courses.filter((c) => c.status === "completed");

  const liveStats = useMemo(() => {
    const completed = completedCourses.length;
    const totalHours = courses.reduce((sum, c) => {
      const pct = Number(c.progress || 0) / 100;
      return sum + pct * 6;
    }, 0);

    return {
      coursesCompleted: completed,
      hoursStudied: Math.round(totalHours),
      streakDays: Math.max(1, Math.min(14, inProgressCourses.length * 2)),
    };
  }, [courses, completedCourses.length, inProgressCourses.length]);

  const liveWeekSchedule = useMemo(() => {
    const now = new Date();
    const activeCourses = inProgressCourses.length
      ? inProgressCourses
      : courses.slice(0, 3);

    if (activeCourses.length === 0) {
      return [];
    }

    return activeCourses.slice(0, 4).map((course, index) => {
      const when = new Date(now);
      when.setDate(now.getDate() + index);
      when.setHours(15 + (index % 3), index % 2 === 0 ? 0 : 30, 0, 0);

      const isToday = index === 0;
      const dayLabel = isToday
        ? "Today"
        : when.toLocaleDateString([], { weekday: "long" });
      const timeLabel = when.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      return {
        id: course.id,
        title: `${course.title.split(" ").slice(0, 3).join(" ")} Session`,
        time: `${dayLabel}, ${timeLabel}`,
        isToday,
      };
    });
  }, [courses, inProgressCourses]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LearnerTopNav student={mockStudent} />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col mb-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-1 w-fit"
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
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  My Learning
                </h1>
                <CourseSearchFilter />
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-base font-bold text-gray-800 mb-3">
                In Progress
              </h2>
              {loading && (
                <div className="text-sm text-gray-500 bg-white border border-gray-100 rounded-2xl p-6 mb-3">
                  Loading your enrolled courses...
                </div>
              )}
              <div className="flex flex-col gap-4">
                {inProgressCourses.length > 0 ? (
                  inProgressCourses.map((course) => (
                    <CourseProgressCard key={course.id} course={course} />
                  ))
                ) : (
                  <div className="text-sm text-gray-400 bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    No courses in progress. Enroll in a course to get started!
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-800 mb-3">
                Completed
              </h2>
              <div className="flex flex-col gap-4">
                {completedCourses.length > 0 ? (
                  completedCourses.map((course) => (
                    <CourseProgressCard key={course.id} course={course} />
                  ))
                ) : (
                  <div className="text-sm text-gray-400 bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    You haven't completed any courses yet. Keep learning!
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="w-72 flex-shrink-0 flex flex-col gap-6">
            <LearningStatsPanel
              stats={loading ? learningProgress : liveStats}
            />

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <SidebarRecommendations courses={recommended} />
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <WeekSchedulePanel schedule={liveWeekSchedule} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
