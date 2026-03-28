import { Play } from "lucide-react";

const difficultyStyles = {
  Easy: "bg-green-100 text-green-600",
  Medium: "bg-yellow-100 text-yellow-600",
  Hard: "bg-red-100 text-red-600",
};

export default function QuizCard({ title, difficulty, description, questions, onPlay }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-[#E2E8F0] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyStyles[difficulty]}`}>
          {difficulty}
        </span>
      </div>
      <p className="text-[#475569] text-sm mb-4 flex-grow">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#94A3B8]">{questions} Questions</span>
        <button
          onClick={onPlay}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          Play Now
        </button>
      </div>
    </div>
  );
}

const featuredQuizzes = [
  {
    id: 1,
    title: "Advanced Vocabulary",
    difficulty: "Hard",
    description: "Challenge yourself with complex words and their usage in context.",
    questions: 15,
  },
  {
    id: 2,
    title: "Grammar Essentials",
    difficulty: "Medium",
    description: "Test your knowledge of English grammar rules and sentence construction.",
    questions: 12,
  },
  {
    id: 3,
    title: "Beginner Basics",
    difficulty: "Easy",
    description: "Start your journey with fundamental English vocabulary and phrases.",
    questions: 10,
  },
];

export { featuredQuizzes };
