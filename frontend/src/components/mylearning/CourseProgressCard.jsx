import { useNavigate } from "react-router-dom";

export default function CourseProgressCard({ course }) {
  const navigate = useNavigate();
  const isCompleted = course.status === "completed";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="flex-shrink-0 flex flex-col items-start gap-1.5">
        <span className="text-xs bg-blue-50 text-blue-500 font-medium px-2.5 py-1 rounded-md">
          {course.type}
        </span>
        <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mt-1">
          <svg
            className="w-7 h-7 text-white"
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
        </div>
        <p className="text-xs text-gray-400 text-center w-14 leading-tight">
          {course.provider}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-base mb-3">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isCompleted ? "bg-green-500" : "bg-blue-200"
              }`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600 flex-shrink-0">
            {course.progress}%
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-2">
          {course.progress}% self learning watched
        </p>

        {!isCompleted && course.expiresInDays && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-amber-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9V7a1 1 0 10-2 0v2H7a1 1 0 000 2h2v2a1 1 0 102 0v-2h2a1 1 0 000-2h-2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-amber-500 font-medium">
              Free course expires in {course.expiresInDays} days
            </span>
          </div>
        )}
        {isCompleted && course.completedDate && (
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-green-500 font-medium">
              Course completed on {course.completedDate}
            </span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <button
          onClick={() => navigate(`/learning/${course.id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200 whitespace-nowrap"
        >
          {isCompleted ? "Continue learning" : "Start learning"}
        </button>
      </div>
    </div>
  );
}
