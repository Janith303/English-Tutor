import { useNavigate } from "react-router-dom";

export default function CourseEnrollCard({ course, onEnroll }) {
  const navigate = useNavigate();

  const handleEnrollClick = async (event) => {
    event.stopPropagation();

    if (onEnroll) {
      const success = await onEnroll(course);
      if (success === false) return;
    }

    navigate(`/learning/${course.id}`);
  };

  return (
    <div
      onClick={() => navigate(`/course/${course.id}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l6.16-3.422A12.083 12.083 0 0121 13c0 5.523-4.477 10-10 10S1 18.523 1 13c0-.974.126-1.92.36-2.822L12 14z"
            />
          </svg>
          {course.level}
        </span>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4 text-yellow-400 fill-yellow-400"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            {course.rating}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-gray-900 text-lg leading-snug">
        {course.title}
      </h3>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
        <span className="text-gray-600 text-sm">{course.instructor}</span>
      </div>

      <p className="text-gray-500 text-sm leading-relaxed">
        {course.description}
      </p>

      <div className="bg-blue-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium mb-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Focus Area
        </div>
        <p className="text-blue-600 text-sm font-semibold">
          {course.focusArea}
        </p>
      </div>

      <div className="flex items-center justify-between text-gray-400 text-sm">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-blue-500 fill-blue-500"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-gray-500">{course.totalLessons} Lessons</span>
        </div>
        <div className="flex items-center gap-1.5">
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
          <span>{course.durationWeeks} weeks</span>
        </div>
      </div>

      <button
        onClick={handleEnrollClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors duration-200 mt-auto"
      >
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
        Enroll Now
      </button>
    </div>
  );
}
