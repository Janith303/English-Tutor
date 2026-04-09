import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QuizNavbar from "./QuizNavbar";
import { CheckCircle, XCircle, Trophy, Clock, Target } from "lucide-react";

export default function WritingQuizResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers, questions } = location.state || { answers: {}, questions: [] };

  const correctAnswers = questions.filter(
    (q, index) => answers[index] === q.correctAnswer
  ).length;

  const percentage = Math.round((correctAnswers / questions.length) * 100);

  useEffect(() => {
    if (!questions.length) {
      navigate("/writing-quiz");
    }
  }, []);

  const getTimeUsed = () => {
    return "4:32";
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <QuizNavbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#0F172A] mb-4">
            Quiz Completed!
          </h1>
          <p className="text-lg text-[#475569]">
            Great effort! Here's how you performed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
              <Target className="w-7 h-7" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">
              {correctAnswers} / {questions.length}
            </p>
            <p className="text-[#94A3B8] text-sm">Correct Answers</p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{percentage}%</p>
            <p className="text-[#94A3B8] text-sm">Score</p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-7 h-7" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{getTimeUsed()}</p>
            <p className="text-[#94A3B8] text-sm">Time Used</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">
            Question Review
          </h2>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const isCorrect = answers[index] === question.correctAnswer;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-[#0F172A] font-medium mb-1">
                        Q{index + 1}: {question.question}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-[#94A3B8]">
                          Your answer: {answers[index] || "Not answered"}
                        </p>
                      )}
                      <p className="text-sm text-green-700 font-medium">
                        Correct: {question.correctAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/writing-quiz")}
            className="w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Take Quiz Again
          </button>
        </div>
      </main>
    </div>
  );
}
