import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorTopNav from "./TutorTopNav";
import TutorStatsGrid from "./TutorStatsGrid";
import EnrollmentBarChart from "./EnrollmentBarChart";
import TutorCoursesGrid from "./TutorCoursesGrid";
import TutorQandA from "../qa/TutorQandA";
import {
  deleteTutorCourse,
  getTutorCourses,
  getTutorDashboardOverview,
  toTutorCourseCard,
} from "../../api/courseApi";

import { tutorProfile } from "../../data/tutorDashboardData";

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

export default function TutorDashboardPage({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [stats, setStats] = useState({
    total_signups: 0,
    total_learners: 0,
    total_courses: 0,
    total_lessons: 0,
  });
  const [enrollmentTrend, setEnrollmentTrend] = useState(
    buildFallbackEnrollmentTrend(),
  );
  const navigate = useNavigate();
  const overviewRef = useRef(null);
  const coursesRef = useRef(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoadingCourses(true);
      const [coursesResult, dashboardResult] = await Promise.allSettled([
        getTutorCourses(),
        getTutorDashboardOverview(),
      ]);

      let mappedCourses = [];
      if (coursesResult.status === "fulfilled") {
        mappedCourses = (coursesResult.value || []).map(toTutorCourseCard);
      } else {
        console.error("Failed to load tutor courses:", coursesResult.reason);
        mappedCourses = [];
      }

      const fallbackLessonCount = mappedCourses.reduce(
        (total, course) => total + toSafeNumber(course.totalLessons),
        0,
      );

      let resolvedStats = {
        total_signups: 0,
        total_learners: 0,
        total_courses: mappedCourses.length,
        total_lessons: fallbackLessonCount,
      };

      let resolvedEnrollmentTrend = buildFallbackEnrollmentTrend();

      if (dashboardResult.status === "fulfilled") {
        const overview = dashboardResult.value || {};
        const apiStats = overview.stats || {};
        const apiTrend = Array.isArray(overview.enrollmentTrend)
          ? overview.enrollmentTrend
          : [];

        resolvedStats = {
          total_signups: toSafeNumber(apiStats.total_signups),
          total_learners: toSafeNumber(apiStats.total_learners),
          total_courses:
            toSafeNumber(apiStats.total_courses) || mappedCourses.length,
          total_lessons:
            toSafeNumber(apiStats.total_lessons) || fallbackLessonCount,
        };

        resolvedEnrollmentTrend =
          apiTrend.length > 0
            ? apiTrend.map((point, index) => ({
                day: toSafeNumber(point?.day) || index + 1,
                enrollments: toSafeNumber(point?.enrollments),
                date: point?.date || null,
              }))
            : buildFallbackEnrollmentTrend();
      } else {
        console.error(
          "Failed to load tutor dashboard overview:",
          dashboardResult.reason,
        );
      }

      setCourses(mappedCourses);
      setStats(resolvedStats);
      setEnrollmentTrend(resolvedEnrollmentTrend);
      setLoadingCourses(false);
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
    }
    navigate("/");
  };

  const handleDeleteCourse = async (course) => {
    if (!course?.id) return;

    const confirmed = window.confirm(
      `Delete \"${course.title}\"? This will remove all chapters, lessons, and enrollments for this course.`,
    );
    if (!confirmed) return;

    setDeletingCourseId(course.id);
    try {
      await deleteTutorCourse(course.id);

      setCourses((prev) => prev.filter((item) => item.id !== course.id));
      setStats((prev) => ({
        ...prev,
        total_courses: Math.max(0, toSafeNumber(prev.total_courses) - 1),
        total_lessons: Math.max(
          0,
          toSafeNumber(prev.total_lessons) - toSafeNumber(course.totalLessons),
        ),
      }));
    } catch (deleteError) {
      console.error("Failed to delete course:", deleteError);
      alert(
        deleteError?.response?.data?.error ||
          "Could not delete this course. Please try again.",
      );
    } finally {
      setDeletingCourseId(null);
    }
  };

  const tutorStats = [
    {
      id: "signups",
      label: "TOTAL SIGNUPS",
      value: toSafeNumber(stats.total_signups).toLocaleString(),
      icon: "users",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      id: "customers",
      label: "TOTAL LEARNERS",
      value: toSafeNumber(stats.total_learners).toLocaleString(),
      icon: "sparkles",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-500",
    },
    {
      id: "courses",
      label: "TOTAL COURSES",
      value: toSafeNumber(stats.total_courses).toLocaleString(),
      icon: "book",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      id: "lessons",
      label: "TOTAL LESSONS",
      value: toSafeNumber(stats.total_lessons).toLocaleString(),
      icon: "list",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
    },
  ];

  const handleNavigate = (page) => {
    setActivePage(page);
    // Scrolling logic for the main dashboard sections
    if (page === "dashboard" && overviewRef.current) {
      setTimeout(() => {
        overviewRef.current.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
    if (page === "courses" && coursesRef.current) {
      setTimeout(() => {
        coursesRef.current.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TutorTopNav
        activePage={activePage}
        onNavigate={handleNavigate}
        tutor={tutorProfile}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-y-auto">
        {/* 2. CHANGED: Conditional Rendering Logic */}
        {activePage === "qa" ? (
          /* When the activePage is 'qa', show your component */
          <TutorQandA />
        ) : (
          /* Otherwise, show the original dashboard content */
          <main className="max-w-5xl mx-auto px-8 pt-2 pb-8 flex flex-col gap-7">
            <div ref={overviewRef} className="flex flex-col gap-3">
              <h1 className="text-4xl md:text-[2.5rem] font-black tracking-tight text-black leading-tight">
                Academic Overview
              </h1>

              <TutorStatsGrid stats={tutorStats} />
            </div>

            <EnrollmentBarChart data={enrollmentTrend} />

            <div ref={coursesRef}>
              {loadingCourses && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 mb-5">
                  Loading your courses...
                </div>
              )}
              <TutorCoursesGrid
                courses={courses}
                onEdit={(course) =>
                  navigate(`/edit-course?courseId=${course.id}`)
                }
                onCreate={() => navigate("/edit-course")}
                onDelete={handleDeleteCourse}
                deletingCourseId={deletingCourseId}
              />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
