export default function LessonTrackerList({
  lessons,
  earnedCredits,
  onStartLesson,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-5 text-base">Course Lessons</h3>

      <div className="flex flex-col gap-3">
        {lessons.map((lesson) => {
          const isLocked =
            !lesson.isUnlocked &&
            earnedCredits < lesson.requiredCreditsToUnlock;
          const isCompleted = lesson.isCompleted;
          const isActive = !isCompleted && !isLocked;

          return (
            <div
              key={lesson.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                isCompleted
                  ? "bg-green-50 border-green-100"
                  : isLocked
                    ? "bg-gray-50 border-gray-100 opacity-70"
                    : "bg-blue-50 border-blue-100 hover:bg-blue-100 cursor-pointer"
              }`}
              onClick={() => isActive && onStartLesson && onStartLesson(lesson)}
            >
              <div
                className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${
                  isCompleted
                    ? "bg-green-500"
                    : isLocked
                      ? "bg-gray-200"
                      : "bg-blue-600"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : isLocked ? (
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-white fill-white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">
                    Lesson {lesson.order}
                  </span>
                  {isCompleted && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      Completed
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">
                      Locked
                    </span>
                  )}
                </div>
                <p
                  className={`font-semibold text-sm mt-0.5 truncate ${
                    isLocked ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  {lesson.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">
                    {lesson.duration}
                  </span>
                  {isLocked ? (
                    <span className="text-xs text-amber-500">
                      🔒 Requires {lesson.requiredCreditsToUnlock} credits
                    </span>
                  ) : (
                    <span className="text-xs text-blue-500">
                      +{lesson.creditsAwarded} credits on completion
                    </span>
                  )}
                </div>
              </div>

              {isActive && (
                <svg
                  className="w-4 h-4 text-blue-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
