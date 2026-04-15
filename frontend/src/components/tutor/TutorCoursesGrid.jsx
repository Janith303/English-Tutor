import TutorCourseCard from "./TutorCourseCard";

function CreateAtelierCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-50 border border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-[320px] cursor-pointer hover:border-indigo-400 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="w-12 h-12 bg-slate-200 group-hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors">
        <svg
          className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors"
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
        <p className="font-semibold text-black text-sm">Create New Course</p>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Design a new learning experience for your students.
        </p>
      </div>
    </div>
  );
}

export default function TutorCoursesGrid({
  courses,
  onEdit,
  onCreate,
  onDelete,
  deletingCourseId,
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-black">Your Courses</h2>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
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
          <TutorCourseCard
            key={course.id}
            course={course}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={deletingCourseId === course.id}
          />
        ))}
        <CreateAtelierCard onClick={onCreate} />
      </div>
    </section>
  );
}
