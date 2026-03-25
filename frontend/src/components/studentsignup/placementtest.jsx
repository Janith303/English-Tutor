import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Topnav";
import ProgressBar from "../progressbar/studentp";
import { 
  GraduationCap, 
  ChevronRight, 
  ChevronLeft, 
  Timer, 
  CheckCircle2, 
  Trophy,
  Target
} from "lucide-react";

// 1. Static Questions Data
const questions = [
  {
    id: 1,
    question: "Choose the correct sentence for a formal research paper:",
    options: [
      "The results was really cool and showed stuff.",
      "The data indicates a significant correlation between the variables.",
      "I think the numbers are basically saying it's linked.",
      "The stuff we found shows that things change."
    ],
    correct: 1
  },
  {
    id: 2,
    question: "Which connector is best used to show contrast?",
    options: ["Furthermore", "Moreover", "Consequently", "However"],
    correct: 3
  },
  {
    id: 3,
    question: "Identify the passive voice version: 'The student wrote the essay.'",
    options: [
      "The student is writing the essay.",
      "The essay was written by the student.",
      "The essay writes the student.",
      "The student had written the essay."
    ],
    correct: 1
  }
];

export default function PlacementTest() {
  const navigate = useNavigate();
  
  // State Management
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Function to calculate score and show results
  const handleComplete = () => {
    let finalScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setIsFinished(true);
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQ]: optionIndex });
  };

  const isLastQuestion = currentQ === questions.length - 1;

  // Function to determine Level Label
  const getLevel = () => {
    if (score === 3) return "Advanced";
    if (score === 2) return "Intermediate";
    return "Beginner";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      <Navbar />
   
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Left - Bright Electric Cyan/Blue */}
        <div className="absolute top-[-20%] left-[-10%] w-175 h-175 bg-cyan-400/40 rounded-full blur-[130px] animate-pulse" />

        {/* Top Right - Soft Neon Purple/Magenta */}
        <div className="absolute top-[-10%] right-[-15%] w-200 h-200 bg-fuchsia-400/30 rounded-full blur-[160px]" />

        {/* Center Right - Vibrant Royal Blue */}
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[140px]" />

        {/* Bottom Left - Soft Pastel Pink/Rose */}
        <div className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-pink-400/30 rounded-full blur-[120px]" />
      </div>


      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-12">
        <ProgressBar currentStep={3} />

        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {!isFinished ? (
            /* --- SECTION: THE QUESTIONS --- */
            <>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <GraduationCap className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                      Question {currentQ + 1} of {questions.length}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">Quick Assessment</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg shadow-slate-200">
                  <Timer className="w-4 h-4 text-blue-400" />
                  <span className="font-mono font-bold text-sm">04:52</span>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-xl text-slate-800 font-semibold leading-relaxed">
                  {questions[currentQ].question}
                </p>
              </div>

              <div className="space-y-3">
                {questions[currentQ].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center group ${
                      selectedAnswers[currentQ] === idx
                        ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50"
                        : "border-slate-100 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors ${
                      selectedAnswers[currentQ] === idx ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`font-medium ${selectedAnswers[currentQ] === idx ? "text-blue-700" : "text-slate-700"}`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Previous Question
                </button>

                <button
                  onClick={() => isLastQuestion ? handleComplete() : setCurrentQ(prev => prev + 1)}
                  disabled={selectedAnswers[currentQ] === undefined}
                  className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 ${
                    selectedAnswers[currentQ] !== undefined
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isLastQuestion ? "See Results" : "Next Question"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            /* --- SECTION: THE RESULTS VIEW --- */
            <div className="text-center py-6 animate-in zoom-in duration-500">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                  <Trophy className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
                   <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-900">Analysis Complete!</h2>
              <p className="text-slate-500 mt-2">Based on your answers, your current level is:</p>
              
              <div className="mt-10 p-10 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                 {/* Decorative Lucide Icon in Background */}
                 <Target className="absolute top-[-20px] right-[-20px] w-48 h-48 text-white/10 rotate-12" />
                 
                 <p className="text-blue-200 uppercase tracking-[0.2em] font-bold text-xs relative z-10">Proficiency Level</p>
                 <h3 className="text-6xl font-black mt-3 mb-4 tracking-tight relative z-10">
                   {getLevel()}
                 </h3>
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/50 backdrop-blur-sm rounded-full text-sm font-bold border border-blue-400 relative z-10">
                   <Target className="w-4 h-4" />
                   Score: {score} / {questions.length} Correct
                 </div>
              </div>

              <button 
                onClick={() => navigate("/dashboard")}
                className="mt-10 w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
              >
                Enter My Dashboard <ChevronRight className="w-5 h-5 text-blue-400" />
              </button>
              
              <p className="mt-6 text-slate-400 text-xs font-medium">
                Our AI will continue to adapt to your progress.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}