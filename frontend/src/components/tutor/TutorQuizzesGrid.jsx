import TutorQuizCard from "./TutorQuizCard";

export default function TutorQuizzesGrid({
  quizzes,
  onStart,
  onEdit,
  onDelete,
  deletingQuizId,
  onCreateNew,
  loading,
}) {
  if (loading) {
    return (
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-black">My Quizzes</h2>
        </div>
        <div className="flex items-center justify-center py-12 text-slate-500">
          Loading your quizzes...
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-black">My Quizzes</h2>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          Create Quiz
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

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <svg
            className="w-12 h-12 mb-3 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="font-medium text-slate-600">No quizzes created yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Start by creating your first quiz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <TutorQuizCard
              key={quiz.id}
              quiz={quiz}
              onStart={onStart}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingQuizId === quiz.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
