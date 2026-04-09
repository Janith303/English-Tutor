import { useEffect, useState } from "react";
import LearnerTopNav from "./LearnerTopNav";
import WelcomeHeroBanner from "./WelcomeHeroBanner";
import RecommendedCoursesGrid from "./RecommendedCoursesGrid";
import { mockStudent, mockCourses } from "../../data/mockCourses";
import {
  createEnrollment,
  getPublishedCourses,
  levelToLabel,
  toLearnerCourseCard,
} from "../../api/courseApi";

export default function LearnerDashboard({ onEnroll }) {
  const student = mockStudent;
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await getPublishedCourses();
        const studentLevel = (student?.level || "").toLowerCase();
        const mapped = (data || []).map(toLearnerCourseCard);
        const filtered = mapped.filter(
          (course) => course.level.toLowerCase() === studentLevel,
        );
        setRecommendedCourses(filtered.length ? filtered : mapped);
      } catch (error) {
        console.error("Failed to load published courses:", error);
        setRecommendedCourses(
          mockCourses.filter((c) => c.level === levelToLabel(student.level)),
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [student.level]);

  const handleEnroll = async (course) => {
    try {
      await createEnrollment(course.id);
      onEnroll && onEnroll(course);
      return true;
    } catch (error) {
      if (error?.response?.status === 400) {
        alert(error?.response?.data?.course_id || "You are already enrolled.");
        return true;
      }
      alert("Enrollment failed. Please try again.");
      return false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LearnerTopNav student={student} />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col gap-8">
          <WelcomeHeroBanner student={student} />
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-500">
              Loading recommended courses...
            </div>
          )}
          <RecommendedCoursesGrid
            courses={recommendedCourses}
            onEnroll={handleEnroll}
          />
        </div>
      </div>
    </div>
  );
}
