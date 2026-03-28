import { useNavigate } from "react-router-dom";
import QuizNavbar from "./QuizNavbar";
import Hero from "./Hero";
import CategoryCard, { categories } from "./CategoryCard";
import QuizCard, { featuredQuizzes } from "./QuizCard";

export default function QuizHome() {
  const navigate = useNavigate();

  const handleDailyQuiz = () => {
    console.log("Starting daily quiz...");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handlePlayQuiz = (quizId) => {
    console.log(`Starting quiz ${quizId}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-200">
      <QuizNavbar />

      <main>
        <Hero onDailyQuiz={handleDailyQuiz} onDashboard={handleDashboard} />

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Quiz Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                icon={category.icon}
                title={category.title}
                description={category.description}
              />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Featured Quizzes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                title={quiz.title}
                difficulty={quiz.difficulty}
                description={quiz.description}
                questions={quiz.questions}
                onPlay={() => handlePlayQuiz(quiz.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
