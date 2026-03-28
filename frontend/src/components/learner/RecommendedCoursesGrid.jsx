import CourseEnrollCard from "./CourseEnrollCard";

export default function RecommendedCoursesGrid({ courses, onEnroll }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0F172A]">Recommended Courses</h2>
        <button className="text-[#2563EB] text-sm font-medium hover:underline">
          View All
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8]">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-[#DBEAFE]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              
            />
          </svg>
          <p>No courses found for your level and area.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseEnrollCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
            />
          ))}
        </div>
      )}
    </section>
  );
}
