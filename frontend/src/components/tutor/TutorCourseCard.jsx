import privateApi from "../../api/axios";

const API_ORIGIN = (() => {
  try {
    return new URL(privateApi.defaults.baseURL || window.location.origin)
      .origin;
  } catch {
    return window.location.origin;
  }
})();

export default function TutorCourseCard({
  course,
  onEdit,
  onDelete,
  isDeleting,
}) {
  const thumbnailUrl = course?.thumbnail
    ? /^https?:\/\//i.test(course.thumbnail)
      ? course.thumbnail
      : `${API_ORIGIN}${String(course.thumbnail).startsWith("/") ? "" : "/"}${course.thumbnail}`
    : "";

  const isRejected = course.approvalStatus === 'REJECTED' && course.rejectionReason;

  return (
    <div className="bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex h-56">
      <div
        className={`relative w-1/3 overflow-hidden flex flex-col items-center justify-center ${thumbnailUrl ? "bg-slate-200" : `bg-gradient-to-br ${course.thumbnailBg}`}`}
      >
        {thumbnailUrl ? (
          <>
            <img
              src={thumbnailUrl}
              alt={`${course.title} thumbnail`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </>
        ) : (
          <div className="text-center px-4 opacity-60">
            <p
              className={`text-lg font-bold ${course.thumbnailAccent} leading-tight`}
            >
              {course.thumbnailLabel}
            </p>
          </div>
        )}

        {isRejected ? (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Rejected
          </span>
        ) : (
          <span className="absolute top-3 right-3 bg-white text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
            {course.status}
          </span>
        )}
      </div>

      <div className="w-2/3 p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-extrabold text-white text-base leading-snug">
          {course.title}
        </h3>
        <p className="text-sm text-white font-semibold leading-relaxed flex-1">
          {course.description}
        </p>

        {isRejected && (
          <div className="mt-1 p-2 bg-red-500/30 rounded-lg">
            <p className="text-xs text-red-200 font-semibold">
              Rejection Reason:
            </p>
            <p className="text-xs text-white">
              {course.rejectionReason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit && onEdit(course)}
              className="bg-white/20 hover:bg-white hover:text-blue-600 text-white text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(course)}
              disabled={isDeleting}
              className="bg-red-500/25 hover:bg-red-500 text-white text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}