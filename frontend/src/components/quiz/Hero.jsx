import { useNavigate } from "react-router-dom";

export default function Hero({ onDailyQuiz }) {
  const navigate = useNavigate();

  const handleDailyQuiz = () => {
    if (onDailyQuiz) {
      onDailyQuiz();
    } else {
      navigate("/daily-quiz");
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#EAF2FF] to-[#F5F9FF] py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
          Test Your English Skills
        </h1>
        <p className="text-lg text-[#475569] mb-10 max-w-2xl mx-auto leading-relaxed">
          Fun, fast, and interactive quizzes to improve your vocabulary, grammar, and comprehension.
        </p>
        <button
          onClick={handleDailyQuiz}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
        >
          Daily Quiz
        </button>
      </div>
    </section>
  );
}
