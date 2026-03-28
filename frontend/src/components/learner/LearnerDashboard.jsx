import LearnerTopNav from "./LearnerTopNav";
import WelcomeHeroBanner from "./WelcomeHeroBanner";
import RecommendedCoursesGrid from "./RecommendedCoursesGrid";
import { mockStudent, mockCourses } from "../../data/mockCourses";

export default function LearnerDashboard({ onEnroll }) {
  const student = mockStudent;

  const recommendedCourses = mockCourses.filter(
    (c) => c.level === student.level,
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <LearnerTopNav student={student} />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col gap-8">
          <WelcomeHeroBanner student={student} />
          <RecommendedCoursesGrid
            courses={recommendedCourses}
            onEnroll={onEnroll}
          />
        </div>
      </div>
    </div>
  );
}
