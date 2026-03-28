import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorSidebar from "./TutorSidebar";
import TutorStatsGrid from "./TutorStatsGrid";
import EnrollmentBarChart from "./EnrollmentBarChart";
import TutorCoursesGrid from "./TutorCoursesGrid";
import {
  tutorProfile,
  tutorStats,
  enrollmentChartData,
  tutorCourses,
} from "../../data/tutorDashboardData";

export default function TutorDashboardPage({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();
  const coursesRef = useRef(null);

  const handleLogout = () => {
    navigate("/");
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    if (page === "courses" && coursesRef.current) {
      setTimeout(() => {
        coursesRef.current.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TutorSidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        tutor={tutorProfile}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-7">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Academic Overview
            </h1>
          </div>

          <TutorStatsGrid stats={tutorStats} />

          <EnrollmentBarChart data={enrollmentChartData} />

          <div ref={coursesRef}>
            <TutorCoursesGrid
              courses={tutorCourses}
              onEdit={(course) => alert(`Editing: ${course.title}`)}
              onCreate={() => alert("Create course clicked")}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
