import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import QuizNavbar from "./QuizNavbar";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/quizzes/${id}/`);
        setQuiz(response.data);
        const quizTimeMinutes = response.data.time_limit || 5;
        setTimeLeft(quizTimeMinutes * 60);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswer) return;

    setSelectedAnswer(option);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || null);
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
    }
  };

  const handleQuizComplete = () => {
    const totalTime = (quiz?.time_limit || 5) * 60;
    const usedTime = totalTime - timeLeft;
    navigate(`/quiz/${id}/result`, {
      state: { answers, quiz, timeUsed: usedTime },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F9FF]">
        <QuizNavbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-[#475569]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#F5F9FF]">
        <QuizNavbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-red-500">{error || "Quiz not found"}</p>
        </div>
      </div>
    );
  }

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <QuizNavbar />

      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#0F172A] font-semibold">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <div className="flex items-center gap-2 text-[#2563EB] font-semibold">
              <span className="text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-sm text-[#94A3B8]">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm mb-5">
          <h2 className="text-xl font-bold text-[#0F172A] mb-5">
            {question?.question_text}
          </h2>

          <div className="space-y-3">
            {question?.options?.map((option, index) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.is_correct;
              const showResult = selectedAnswer !== null;

              let buttonClass = "w-full text-left px-6 py-3.5 rounded-xl border-2 transition-all ";

              if (showResult) {
                if (isCorrect) {
                  buttonClass += "bg-green-50 border-green-500 text-green-700";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "bg-red-50 border-red-500 text-red-700";
                } else {
                  buttonClass += "bg-gray-50 border-gray-200 text-[#94A3B8]";
                }
              } else {
                buttonClass +=
                  "bg-gray-50 border-gray-200 text-[#0F172A] hover:border-[#2563EB] hover:bg-blue-50 cursor-pointer";
              }

              return (
                <button
                  key={option.id || index}
                  onClick={() => handleAnswerSelect(option)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option.option_text}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              currentQuestion === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-medium transition-all"
          >
            {currentQuestion === totalQuestions - 1 ? "Finish Quiz" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
