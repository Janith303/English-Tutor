import { useNavigate } from "react-router-dom";
import QuizNavbar from "./QuizNavbar";
import Hero from "./Hero";
import CategoryCard, { categories } from "./CategoryCard";
import QuizCard, { featuredQuizzes } from "./QuizCard";

export default function QuizHome() {
  const navigate = useNavigate();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                title={quiz.title}
                difficulty={quiz.difficulty}
                description={quiz.description}
                questions={quiz.questions}
                onPlay={() => console.log(`Starting quiz ${quiz.id}...`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
