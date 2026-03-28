export default function TutorCourseCard({ course, onEdit }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex h-56">
      <div
        className={`relative w-1/3 bg-gradient-to-br ${course.thumbnailBg} flex flex-col items-center justify-center`}
      >
        <div className="text-center px-4 opacity-60">
          <p
            className={`text-lg font-bold ${course.thumbnailAccent} leading-tight`}
          >
            {course.thumbnailLabel}
          </p>
        </div>

        <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {course.status}
        </span>
      </div>

      <div className="w-2/3 p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-bold text-gray-900 text-base leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed flex-1">
          {course.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {course.totalLessons} Lessons
          </div>
          <button
            onClick={() => onEdit && onEdit(course)}
            className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
          >
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
}
