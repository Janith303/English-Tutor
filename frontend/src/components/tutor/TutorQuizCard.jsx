import { Play, Edit2, Trash2 } from "lucide-react";

const difficultyStyles = {
  Easy: "bg-green-100 text-green-600",
  Medium: "bg-yellow-100 text-yellow-600",
  Hard: "bg-red-100 text-red-600",
};

export default function TutorQuizCard({ quiz, onStart, onEdit, onDelete, isDeleting }) {
  const difficultyLabel = quiz.difficulty?.charAt(0) + quiz.difficulty?.slice(1).toLowerCase() || "Easy";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#0F172A] line-clamp-1 pr-2">{quiz.title}</h3>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${difficultyStyles[difficultyLabel] || difficultyStyles.Easy}`}>
          {difficultyLabel}
        </span>
      </div>
      
      <p className="text-[11px] text-[#64748B] mb-3 line-clamp-2 flex-grow">{quiz.description}</p>
      
      <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
        <span className="bg-slate-100 px-2 py-0.5 rounded">{quiz.category}</span>
        <span>{quiz.time_limit || 5} min</span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onStart && onStart(quiz)}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Play className="w-3 h-3" />
          Start
        </button>
        <button
          onClick={() => onEdit && onEdit(quiz)}
          disabled={isDeleting}
          className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete && onDelete(quiz)}
          disabled={isDeleting}
          className="flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
