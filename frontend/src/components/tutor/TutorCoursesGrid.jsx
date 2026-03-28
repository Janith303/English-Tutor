import TutorCourseCard from "./TutorCourseCard";

function CreateAtelierCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-[320px] cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <div className="text-center px-4">
        <p className="font-semibold text-gray-700 text-sm">
          Create New Atelier
        </p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          Design a new learning experience for your students.
        </p>
      </div>
    </div>
  );
}

export default function TutorCoursesGrid({ courses, onEdit, onCreate }) {
  return (
    <section className="hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:underline"
        >
          Create Course
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
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <TutorCourseCard key={course.id} course={course} onEdit={onEdit} />
        ))}
        <CreateAtelierCard onClick={onCreate} />
      </div>
    </section>
  );
}
