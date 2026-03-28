import { useNavigate } from "react-router-dom";
import LearnerTopNav from "../learner/LearnerTopNav";
import WelcomeHeroBanner from "../learner/WelcomeHeroBanner";
import RecommendedCoursesGrid from "../learner/RecommendedCoursesGrid";
import { mockStudent, mockCourses } from "../../data/mockCourses";

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const student = mockStudent;

  const recommendedCourses = mockCourses.filter(
    (c) => c.level === student.level
  );

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