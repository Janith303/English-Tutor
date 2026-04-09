import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorTopNav from "./TutorTopNav";
import TutorStatsGrid from "./TutorStatsGrid";
import EnrollmentBarChart from "./EnrollmentBarChart";
import TutorCoursesGrid from "./TutorCoursesGrid";
import TutorQandA from "../qa/TutorQandA";
import { getTutorCourses, toTutorCourseCard } from "../../api/courseApi";

import {
  tutorProfile,
  tutorStats,
  enrollmentChartData,
} from "../../data/tutorDashboardData";

export default function TutorDashboardPage({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const navigate = useNavigate();
  const overviewRef = useRef(null);
  const coursesRef = useRef(null);

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const data = await getTutorCourses();
        setCourses((data || []).map(toTutorCourseCard));
      } catch (error) {
        console.error("Failed to load tutor courses:", error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

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
          <main className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-7">
            <div ref={overviewRef}>
              <h1 className="text-3xl font-bold text-gray-900">
                Academic Overview
              </h1>
            </div>

            <TutorStatsGrid stats={tutorStats} />

            <EnrollmentBarChart data={enrollmentChartData} />

            <div ref={coursesRef}>
              {loadingCourses && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-500 mb-4">
                  Loading your courses...
                </div>
              )}
              <TutorCoursesGrid
                courses={courses}
                onEdit={(course) =>
                  navigate(`/edit-course?courseId=${course.id}`)
                }
                onCreate={() => navigate("/edit-course")}
              />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
