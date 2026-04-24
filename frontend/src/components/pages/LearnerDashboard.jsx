import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LearnerTopNav from "../learner/LearnerTopNav";
import WelcomeHeroBanner from "../learner/WelcomeHeroBanner";
import RecommendedCoursesGrid from "../learner/RecommendedCoursesGrid";
import { mockStudent, mockCourses } from "../../data/mockCourses";
import {
  filterCoursesForStudentPreferences,
  getPublishedCourses,
  getStudentProfile,
  toLearnerCourseCard,
  toLearnerStudentProfile,
} from "../../api/courseApi";

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(mockStudent);
  const [recommendedCourses, setRecommendedCourses] = useState(mockCourses);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileData, published] = await Promise.all([
          getStudentProfile(),
          getPublishedCourses(),
        ]);

        const resolvedStudent = toLearnerStudentProfile(
          profileData,
          mockStudent,
        );
        setStudent(resolvedStudent);

        const mappedCourses = (published || []).map(toLearnerCourseCard);
        setRecommendedCourses(
          filterCoursesForStudentPreferences(mappedCourses, resolvedStudent),
        );
      } catch (error) {
        console.error("Failed to load legacy learner dashboard data:", error);
        setStudent(mockStudent);
        setRecommendedCourses(
          filterCoursesForStudentPreferences(mockCourses, mockStudent),
        );
      }
    };

    loadDashboard();
  }, []);

  const handleEnroll = (course) => {
    navigate("/hub", { state: { course } });
  };

  return (
    <div className="min-h-screen bg-[#EFF6FF]">
      <LearnerTopNav student={student} />

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        <WelcomeHeroBanner student={student} />

        <RecommendedCoursesGrid
          courses={recommendedCourses}
          onEnroll={handleEnroll}
        />
      </main>
    </div>
  );
}
