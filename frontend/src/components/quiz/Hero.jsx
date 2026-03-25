export default function Hero({ onDailyQuiz }) {
  return (
    <section className="bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-200 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Test Your English Skills
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Fun, fast, and interactive quizzes to improve your vocabulary, grammar, and comprehension.
        </p>
        <button
          onClick={onDailyQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
        >
          Daily Quiz
        </button>
      </div>
    </section>
  );
}
