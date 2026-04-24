import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getQuizzes } from "../../api/quizApi";
import QuizNavbar from "./QuizNavbar";
import Hero from "./Hero";
import CategoryCard, { categories } from "./CategoryCard";
import { BookOpen, FileText, Eye, MessageSquare, Pen, LayoutList, Clock, Star, Zap, Play } from "lucide-react";

const CATEGORY_ICONS = {
  Vocabulary: BookOpen,
  Grammar: FileText,
  Reading: Eye,
  Idioms: MessageSquare,
  Writing: Pen,
  "Sentence Structure": LayoutList,
};

const CATEGORY_DIFFICULTY_COLORS = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

const difficultyStyles = {
  Easy: "bg-green-100 text-green-600",
  Medium: "bg-yellow-100 text-yellow-600",
  Hard: "bg-red-100 text-red-600",
};

function DynamicQuizCard({ quiz, onStart, onCardClick }) {
  const Icon = CATEGORY_ICONS[quiz.category] || BookOpen;
  const difficultyColor = CATEGORY_DIFFICULTY_COLORS[quiz.difficulty] || "bg-gray-100 text-gray-700";
  const questionCount = quiz.questions?.length || quiz.question_count || 0;
  const timeLimit = quiz.time_limit || "10 min";
  const categoryTags = quiz.category ? [quiz.category] : [];

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
            {quiz.difficulty}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A] mb-1.5">{quiz.title}</h3>
        <p className="text-sm text-[#475569] mb-3 leading-snug">{quiz.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {categoryTags.map((tag, index) => (
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
            {questionCount} Q
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {timeLimit}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-base font-medium text-[#0F172A]">4.8</span>
            <span className="text-xs text-[#94A3B8]">(1.2k)</span>
          </div>
          <span className="flex items-center gap-1.5 text-base font-medium text-purple-600">
            <Zap className="w-4 h-4" />
            +{questionCount * 10}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className="w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 mx-auto mb-5"
      >
        <Play className="w-4 h-4" />
        Start Quiz
      </button>
    </div>
  );
}

export default function QuizHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [location.key]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchQuizzes();
      }
    };

    const handleFocus = () => {
      fetchQuizzes();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const groupedQuizzes = quizzes.reduce((acc, quiz) => {
    const category = quiz.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(quiz);
    return acc;
  }, {});

  const categoryOrder = ["Vocabulary", "Grammar", "Reading", "Idioms", "Writing", "Sentence Structure"];
  const sortedCategories = Object.keys(groupedQuizzes).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const handleQuizClick = (quizId) => {
    navigate(`/quiz/${quizId}/play`);
  };

  const handleDailyQuiz = () => {
    navigate("/daily-quiz");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 1) {
      navigate("/vocabulary-quiz");
    } else if (categoryId === 2) {
      navigate("/grammar-quiz");
    } else if (categoryId === 3) {
      navigate("/reading-quiz");
    } else if (categoryId === 4) {
      navigate("/idioms-quiz");
    } else if (categoryId === 5) {
      navigate("/writing-quiz");
    } else if (categoryId === 6) {
      navigate("/sentence-quiz");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <QuizNavbar />

      <main>
        <Hero onDailyQuiz={handleDailyQuiz} onDashboard={handleDashboard} />

        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-8">
            Quiz Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                icon={category.icon}
                title={category.title}
                description={category.description}
                difficulty={category.difficulty}
                difficultyColor={category.difficultyColor}
                tags={category.tags}
                questions={category.questions}
                time={category.time}
                rating={category.rating}
                reviews={category.reviews}
                points={category.points}
                onStart={() => handleCategoryClick(category.id)}
                onCardClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-10">
            Featured Quizzes
          </h2>

          {loading && (
            <div className="text-center py-12">
              <p className="text-lg text-[#475569]">Loading quizzes...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-lg text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && quizzes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-[#475569]">No quizzes available</p>
            </div>
          )}

          {!loading && !error && quizzes.length > 0 && (
            <div className="space-y-10">
              {sortedCategories.map((category) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-5">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedQuizzes[category].map((quiz) => (
                      <DynamicQuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onStart={() => handleQuizClick(quiz.id)}
                        onCardClick={() => handleQuizClick(quiz.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
