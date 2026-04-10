import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QuizNavbar from "./QuizNavbar";
import { CheckCircle, XCircle, Trophy, Clock, Target, RotateCcw } from "lucide-react";

export default function QuizResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { answers, quiz, timeUsed: initialTimeUsed } = location.state || { answers: {}, quiz: null };

  const quizData = useMemo(() => {
    if (!quiz) return null;
    
    const questions = quiz.questions || [];
    const totalTime = (quiz.time_limit || 5) * 60;
    const timeUsed = initialTimeUsed ?? (totalTime - 0);
    
    let correctCount = 0;
    
    const questionResults = questions.map((question, index) => {
      const userAnswerId = answers[index];
      const correctOption = question.options?.find(opt => opt.is_correct === true);
      const isCorrect = userAnswerId === correctOption?.id;
      
      if (isCorrect) correctCount++;
      
      const userSelectedOption = question.options?.find(opt => opt.id === userAnswerId);
      
      return {
        index,
        questionText: question.question_text,
        userAnswer: userSelectedOption?.option_text || null,
        correctAnswer: correctOption?.option_text,
        isCorrect,
        options: question.options || []
      };
    });
    
    const percentage = questions.length > 0 
      ? Math.round((correctCount / questions.length) * 100) 
      : 0;
    
    return {
      questions,
      questionResults,
      totalQuestions: questions.length,
      correctCount,
      percentage,
      timeUsed,
      totalTime,
      quizTitle: quiz.title || "Quiz"
    };
  }, [quiz, answers, initialTimeUsed]);

  useEffect(() => {
    if (!quiz) {
      navigate("/quiz");
    }
  }, [quiz, navigate]);

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPerformanceMessage = () => {
    if (!quizData) return "";
    const { percentage } = quizData;
    if (percentage >= 90) return "Outstanding! You're a quiz master!";
    if (percentage >= 70) return "Great job! Keep up the good work!";
    if (percentage >= 50) return "Good effort! Practice makes perfect.";
    return "Keep learning! You'll improve with time.";
  };

  const getPerformanceColor = () => {
    if (!quizData) return "from-[#2563EB] to-[#3B82F6]";
    const { percentage } = quizData;
    if (percentage >= 70) return "from-green-500 to-emerald-600";
    if (percentage >= 50) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-600";
  };

  if (!quizData) {
    return (
      <div className="min-h-screen bg-[#F5F9FF]">
        <QuizNavbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-[#475569]">Loading results...</p>
        </div>
      </div>
    );
  }

  const { questionResults, totalQuestions, correctCount, percentage, timeUsed, quizTitle } = quizData;

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <QuizNavbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className={`w-20 h-20 bg-gradient-to-br ${getPerformanceColor()} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#0F172A] mb-4">
            Quiz Completed!
          </h1>
          <p className="text-lg text-[#475569]">
            {getPerformanceMessage()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Target className="w-7 h-7" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">
              {correctCount} / {totalQuestions}
            </p>
            <p className="text-[#94A3B8] text-sm">Questions Correct</p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{percentage}%</p>
            <p className="text-[#94A3B8] text-sm">Score Percentage</p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-7 h-7" />
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">{formatTime(timeUsed)}</p>
            <p className="text-[#94A3B8] text-sm">Time Used</p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">
            Question Review
          </h2>
          <div className="space-y-4">
            {questionResults.map((result) => (
              <div
                key={result.index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  result.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-[#0F172A] font-medium mb-2">
                      Question {result.index + 1}: {result.questionText}
                    </p>
                    
                    {!result.isCorrect && result.userAnswer && (
                      <p className="text-sm text-red-600 mb-1">
                        Your answer: {result.userAnswer}
                      </p>
                    )}
                    
                    {!result.userAnswer && (
                      <p className="text-sm text-[#94A3B8] mb-1 italic">
                        Not answered
                      </p>
                    )}
                    
                    <p className="text-sm text-green-700 font-medium">
                      Correct: {result.correctAnswer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate(`/quiz/${quiz?.id}/play`)}
            className="w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Take Quiz Again
          </button>
        </div>
      </main>
    </div>
  );
}
