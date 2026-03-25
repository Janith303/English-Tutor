import { Play } from "lucide-react";

const difficultyStyles = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

export default function QuizCard({ title, difficulty, description, questions, onPlay }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyStyles[difficulty]}`}>
          {difficulty}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-4 flex-grow">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{questions} Questions</span>
        <button
          onClick={onPlay}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
