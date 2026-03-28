import { BookOpen, FileText, Eye, MessageSquare, Pen, LayoutList, Clock, Star, Zap, Play } from "lucide-react";

const categories = [
  {
    id: 1,
    icon: BookOpen,
    title: "Basic Vocabulary",
    description: "Essential everyday words and their meanings",
    difficulty: "Easy",
    difficultyColor: "bg-green-100 text-green-700",
    tags: ["Common Words", "Daily Life"],
    questions: 15,
    time: "10 min",
    rating: 4.8,
    reviews: 1250,
    points: "+150",
  },
  {
    id: 2,
    icon: FileText,
    title: "Grammar Essentials",
    description: "Improve grammar rules, tenses, and sentence accuracy",
    difficulty: "Medium",
    difficultyColor: "bg-yellow-100 text-yellow-700",
    tags: ["Tenses", "Rules"],
    questions: 12,
    time: "8 min",
    rating: 4.7,
    reviews: 980,
    points: "+120",
  },
  {
    id: 3,
    icon: Eye,
    title: "Reading Practice",
    description: "Build comprehension with short passages and meaning-based questions",
    difficulty: "Medium",
    difficultyColor: "bg-yellow-100 text-yellow-700",
    tags: ["Comprehension", "Analysis"],
    questions: 10,
    time: "12 min",
    rating: 4.6,
    reviews: 860,
    points: "+130",
  },
  {
    id: 4,
    icon: MessageSquare,
    title: "English Idioms",
    description: "Learn common expressions and their real-life meanings",
    difficulty: "Hard",
    difficultyColor: "bg-red-100 text-red-700",
    tags: ["Expressions", "Context"],
    questions: 8,
    time: "7 min",
    rating: 4.9,
    reviews: 720,
    points: "+180",
  },
  {
    id: 5,
    icon: Pen,
    title: "Writing Skills",
    description: "Practice sentence writing, clarity, and expression",
    difficulty: "Medium",
    difficultyColor: "bg-yellow-100 text-yellow-700",
    tags: ["Writing", "Practice"],
    questions: 10,
    time: "15 min",
    rating: 4.7,
    reviews: 640,
    points: "+140",
  },
  {
    id: 6,
    icon: LayoutList,
    title: "Sentence Structure",
    description: "Learn how to build correct and meaningful English sentences",
    difficulty: "Easy",
    difficultyColor: "bg-green-100 text-green-700",
    tags: ["Sentences", "Structure"],
    questions: 14,
    time: "9 min",
    rating: 4.8,
    reviews: 810,
    points: "+160",
  },
];

export default function CategoryCard({
  icon: Icon,
  title,
  description,
  difficulty,
  difficultyColor,
  tags,
  questions,
  time,
  rating,
  reviews,
  points,
  onStart,
  onCardClick,
}) {
  return (
    <div 
      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
      onClick={onCardClick}
    >
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon className="w-5.5 h-5.5" />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
            {difficulty}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A] mb-1.5">{title}</h3>
        <p className="text-sm text-[#475569] mb-3 leading-snug">{description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-[#94A3B8] mb-3">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            {questions} Q
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {time}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-base font-medium text-[#0F172A]">{rating}</span>
            <span className="text-xs text-[#94A3B8]">({reviews})</span>
          </div>
          <span className="flex items-center gap-1.5 text-base font-medium text-purple-600">
            <Zap className="w-4 h-4" />
            {points}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2 group-hover:shadow-lg"
      >
        <Play className="w-4 h-4" />
        Start Quiz
      </button>
    </div>
  );
}

export { categories };
