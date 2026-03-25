export default function Hero({ onDailyQuiz, onDashboard }) {
  return (
    <section className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Test Your English Skills
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Fun, fast, and interactive quizzes to improve your vocabulary, grammar, and comprehension.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onDailyQuiz}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-200"
          >
            Daily Quiz
          </button>
          <button
            onClick={onDashboard}
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Student Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}
