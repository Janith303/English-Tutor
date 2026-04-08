import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import privateApi from "../../api/axios"; // Uses default export
import Navbar from "../Topnav";
import ProgressBar from "../progressbar/studentp";
import {
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Timer,
  CheckCircle2,
  Trophy,
  Target,
  Loader2,
} from "lucide-react";

export default function PlacementTest() {
  const navigate = useNavigate();

  // --- 1. STATE MANAGEMENT ---
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Stores index: optionIndex
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [backendResult, setBackendResult] = useState({ score: 0, level: "" });
  
  // THE FIX: Added the missing timeLeft state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // --- 2. FETCH QUESTIONS FROM BACKEND ---
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await privateApi.get("placement-test/");
        setQuestions(response.data);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        alert("Could not load questions. Please check your database.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // --- 3. TIMER LOGIC ---
  useEffect(() => {
    // Stop timer if test is finished, loading, or time is up
    if (isFinished || loading || timeLeft <= 0) {
      if (timeLeft === 0 && !isFinished) handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, loading]);

  // --- 4. SUBMIT ANSWERS TO BACKEND ---
  const handleComplete = async () => {
    setSubmitting(true);
    try {
      // Format answers for backend: [{"id": 1, "choice": "A"}, ...]
      const formattedAnswers = Object.keys(selectedAnswers).map((index) => ({
        id: questions[index].id,
        choice: String.fromCharCode(65 + selectedAnswers[index]), // 0->A, 1->B, 2->C, 3->D
      }));

      const response = await privateApi.post("placement-test/", {
        answers: formattedAnswers,
      });

      setBackendResult(response.data); // Returns { score, level }
      setIsFinished(true);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit test. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQ]: optionIndex });
  };

  const isLastQuestion = currentQ === questions.length - 1;

  // --- HELPERS ---
  const getOptions = (q) => [q.option_a, q.option_b, q.option_c, q.option_d];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="font-bold text-slate-400 text-xs uppercase tracking-widest">Loading Assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      {/* --- MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-175 h-175 bg-cyan-400/40 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-15%] w-200 h-200 bg-fuchsia-400/30 rounded-full blur-[160px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-pink-400/30 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-10 mt-12">
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
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                      Quick Assessment
                    </h2>
                  </div>
                </div>
                {/* DYNAMIC TIMER */}
                <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg shadow-slate-200">
                  <Timer
                    className={`w-4 h-4 ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-blue-400"}`}
                  />
                  <span className="font-mono font-bold text-sm">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-xl text-slate-800 font-semibold leading-relaxed">
                  {questions[currentQ]?.text}
                </p>
              </div>

              <div className="space-y-3">
                {getOptions(questions[currentQ]).map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center group ${
                      selectedAnswers[currentQ] === idx
                        ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50"
                        : "border-slate-100 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors ${
                        selectedAnswers[currentQ] === idx
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-blue-100"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span
                      className={`font-medium ${selectedAnswers[currentQ] === idx ? "text-blue-700" : "text-slate-700"}`}
                    >
                      {option}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Previous Question
                </button>

                <button
                  onClick={() =>
                    isLastQuestion
                      ? handleComplete()
                      : setCurrentQ((prev) => prev + 1)
                  }
                  disabled={
                    selectedAnswers[currentQ] === undefined || submitting
                  }
                  className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 ${
                    selectedAnswers[currentQ] !== undefined
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      {isLastQuestion ? "See Results" : "Next Question"}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
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

              <h2 className="text-3xl font-black text-slate-900">
                Analysis Complete!
              </h2>
              <p className="text-slate-500 mt-2">
                Based on your answers, your current level is:
              </p>

              <div className="mt-10 p-10 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                <Target className="absolute top-[-20px] right-[-20px] w-48 h-48 text-white/10 rotate-12" />

                <p className="text-blue-200 uppercase tracking-[0.2em] font-bold text-xs relative z-10">
                  Proficiency Level
                </p>
                <h3 className="text-6xl font-black mt-3 mb-4 tracking-tight relative z-10">
                  {backendResult.level}
                </h3>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/50 backdrop-blur-sm rounded-full text-sm font-bold border border-blue-400 relative z-10">
                  <Target className="w-4 h-4" />
                  Score: {backendResult.score} / {questions.length} Correct
                </div>
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="mt-10 w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2"
              >
                Enter My Dashboard{" "}
                <ChevronRight className="w-5 h-5 text-blue-400" />
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