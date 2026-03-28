import { useNavigate } from "react-router-dom";
import QuizNavbar from "./QuizNavbar";
import { BookOpen, Clock, Trophy } from "lucide-react";

export default function DailyQuizStart() {
  const navigate = useNavigate();

  const infoCards = [
    {
      icon: BookOpen,
      value: "10",
      label: "Questions",
    },
    {
      icon: Clock,
      value: "5",
      label: "Minutes",
    },
    {
      icon: Trophy,
      value: "100%",
      label: "Max Score",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <QuizNavbar />

      <main className="max-w-3xl mx-auto px-6 pt-8 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-3">
            English Daily Quiz
          </h1>
          <p className="text-base text-[#475569] max-w-xl mx-auto">
            Test your English skills with 10 carefully selected questions covering
            vocabulary, grammar, and comprehension.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {infoCards.map((card, index) => (
            <div
              key={index}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <card.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{card.value}</p>
              <p className="text-sm text-[#94A3B8] mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Quiz Rules</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
              <span className="text-[#475569]">Each question has one correct answer</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
              <span className="text-[#475569]">You have 5 minutes to complete all questions</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
              <span className="text-[#475569]">Explanation will be shown after answering</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] text-sm font-bold flex items-center justify-center flex-shrink-0">4</span>
              <span className="text-[#475569]">You can navigate between questions</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/daily-quiz/play")}
            className="w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Quiz
          </button>
        </div>
      </main>
    </div>
  );
}
