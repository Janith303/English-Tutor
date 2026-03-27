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
  weekSchedule,
} from "../../data/myLearningData";
import { mockStudent } from "../../data/mockCourses";

export default function MyLearningPage() {
  const navigate = useNavigate();
  const inProgressCourses = enrolledCourses.filter(
    (c) => c.status === "in_progress",
  );
  const completedCourses = enrolledCourses.filter(
    (c) => c.status === "completed",
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LearnerTopNav student={mockStudent} />
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
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
            <LearningStatsPanel stats={learningProgress} />

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <SidebarRecommendations courses={recommendedCourses} />
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <WeekSchedulePanel schedule={weekSchedule} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
