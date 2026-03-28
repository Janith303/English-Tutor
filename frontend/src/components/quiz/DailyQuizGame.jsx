import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QuizNavbar from "./QuizNavbar";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "Which word is a synonym for 'happy'?",
    options: ["Sad", "Joyful", "Angry", "Tired"],
    correctAnswer: "Joyful",
    explanation: "'Joyful' means feeling or expressing great pleasure and happiness, making it a synonym for 'happy'.",
  },
  {
    id: 2,
    question: "Choose the correct sentence:",
    options: [
      "She don't like coffee.",
      "She doesn't likes coffee.",
      "She doesn't like coffee.",
      "She not like coffee.",
    ],
    correctAnswer: "She doesn't like coffee.",
    explanation: "In third person singular, we use 'doesn't' followed by the base verb (like, not likes).",
  },
  {
    id: 3,
    question: "What is the past tense of 'go'?",
    options: ["Goed", "Gone", "Went", "Going"],
    correctAnswer: "Went",
    explanation: "'Went' is the irregular past tense of 'go'. 'Gone' is the past participle.",
  },
  {
    id: 4,
    question: "Select the correctly spelled word:",
    options: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"],
    correctAnswer: "Accommodation",
    explanation: "'Accommodation' has double 'c' and double 'm'. It's one of the most commonly misspelled words.",
  },
  {
    id: 5,
    question: "Which sentence uses the correct article?",
    options: [
      "She is an honest person.",
      "She is a honest person.",
      "She is the honest person.",
      "She is honest person.",
    ],
    correctAnswer: "She is an honest person.",
    explanation: "'An' is used before words starting with a vowel sound. 'Honest' starts with a vowel sound.",
  },
  {
    id: 6,
    question: "What does the idiom 'break the ice' mean?",
    options: [
      "To destroy something",
      "To make people feel comfortable",
      "To go swimming",
      "To end a relationship",
    ],
    correctAnswer: "To make people feel comfortable",
    explanation: "'Break the ice' means to initiate conversation in a social setting to make people feel more comfortable.",
  },
  {
    id: 7,
    question: "Choose the correct plural form:",
    options: ["Childs", "Childrens", "Children", "Childes"],
    correctAnswer: "Children",
    explanation: "'Children' is the irregular plural form of 'child'. It doesn't follow the regular -s pattern.",
  },
  {
    id: 8,
    question: "Which word is an antonym for 'ancient'?",
    options: ["Old", "Modern", "Historic", "Aged"],
    correctAnswer: "Modern",
    explanation: "'Modern' means relating to the present time, which is the opposite of 'ancient' (relating to the distant past).",
  },
  {
    id: 9,
    question: "Select the correct preposition:",
    options: [
      "She arrived in 8 PM.",
      "She arrived at 8 PM.",
      "She arrived on 8 PM.",
      "She arrived by 8 PM.",
    ],
    correctAnswer: "She arrived at 8 PM.",
    explanation: "We use 'at' with specific times. 'On' is used with dates and 'in' with larger time periods.",
  },
  {
    id: 10,
    question: "What is the comparative form of 'good'?",
    options: ["Gooder", "Better", "Best", "More good"],
    correctAnswer: "Better",
    explanation: "'Better' is the irregular comparative form of 'good'. 'Best' is the superlative form.",
  },
];

export default function DailyQuizGame() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (option) => {
    if (selectedAnswer) return;

    setSelectedAnswer(option);
    setShowExplanation(true);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || null);
      setShowExplanation(answers[currentQuestion + 1] ? true : false);
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
      setShowExplanation(answers[currentQuestion - 1] ? true : false);
    }
  };

  const handleQuizComplete = () => {
    navigate("/daily-quiz/result", {
      state: { answers, questions },
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      <QuizNavbar />

      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#0F172A] font-semibold">
              Question {currentQuestion + 1} of {questions.length}
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
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
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
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
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

          {showExplanation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[#2563EB] font-semibold mb-1">Explanation:</p>
              <p className="text-[#475569] text-sm">{question.explanation}</p>
            </div>
          )}
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
            {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
