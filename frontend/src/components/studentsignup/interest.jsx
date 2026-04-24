import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Topnav";
import privateApi from "../../api/axios";
import ProgressBar from "../progressbar/studentp";
import {
  PenTool,
  Mic2,
  Briefcase,
  Puzzle,
  BookText,
  ChevronLeft,
  Target,
  Compass,
  Zap,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

// --- THE FIX: Changed IDs to match Django Database Categories exactly ---
const interestAreas = [
  { id: 1, quizCategory: "GRAMMAR", label: "Grammar & Flow", icon: PenTool, desc: "Essays & Research" },
  { id: 2, quizCategory: "SPEAKING", label: "Presentation Skills", icon: Mic2, desc: "Public Speaking" },
  { id: 3, quizCategory: "VOCABULARY", label: "Vocabulary", icon: Briefcase, desc: "Job Readiness" },
  { id: 4, quizCategory: "WRITING", label: "Academic Writing", icon: Puzzle, desc: "Sentence Structure" },
  { id: 5, quizCategory: "IELTS", label: "IELTS Prep", icon: BookText, desc: "Academic Lexicon" },
];
const levels = [
  { id: "BEGINNER", label: "Beginner", desc: "Basic communication" },
  { id: "INTERMEDIATE", label: "Intermediate", desc: "Standard academic flow" },
  { id: "ADVANCED", label: "Advanced", desc: "Complex research level" },
];

export default function StudentSignUpStep2() {
  const navigate = useNavigate();
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false); 
  const [prepStatus, setPrepStatus] = useState("Analyzing focus areas...");

  useEffect(() => {
    if (isPreparing) {
      const timers = [
        setTimeout(() => setPrepStatus("Customizing your questions..."), 1000),
        setTimeout(() => setPrepStatus("Finalizing placement test..."), 2200),
      ];
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [isPreparing]);

  const handleSubmit = async () => {
    if (!selectedInterest || !selectedLevel) return;

    setLoading(true);
    try {
      await privateApi.post("interests/", {
        interests: [selectedInterest.id], // Now sends ["WRITING"] instead of [4]
        target_level: selectedLevel.id,
      });

      // --- THE FIX: Save the database ID ("WRITING") not the UI label ("Academic Writing") ---
      localStorage.setItem("selectedInterest", selectedInterest.id);

      setIsPreparing(true);

      setTimeout(() => {
        navigate("/signup/test");
      }, 3500);

    } catch (err) {
      console.error(err);
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-10 mt-12">
        
        <ProgressBar currentStep={2} />

        <div className="w-full max-w-4xl min-h-[500px] flex flex-col">
          
          {isPreparing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
                <div className="relative bg-white p-8 rounded-full shadow-2xl">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin" strokeWidth={3} />
                </div>
                <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" size={32} />
              </div>

              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Preparing Your Test
              </h2>
              <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 border border-blue-100 rounded-full">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <p className="text-blue-700 font-bold uppercase tracking-widest text-sm italic">
                  {prepStatus}
                </p>
              </div>

              <div className="mt-12 w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-progress origin-left" />
              </div>
            </div>
          ) : (
            
            <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-12 animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900">Personalize Your Journey</h2>
                <p className="text-slate-500 mt-2 font-medium">This helps us tailor your English learning experience</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    Focus Area
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {interestAreas.map((area) => {
                      const Icon = area.icon;
                      return (
                        <button
                          key={area.id}
                          onClick={() => setSelectedInterest(area)}
                          className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                            selectedInterest?.id === area.id 
                            ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50" 
                            : "border-slate-100 bg-white hover:border-blue-200"
                          }`}
                        >
                          <div className={`p-3 rounded-xl mr-4 ${selectedInterest?.id === area.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`font-bold ${selectedInterest?.id === area.id ? "text-blue-700" : "text-slate-800"}`}>{area.label}</p>
                            <p className="text-xs text-slate-500">{area.desc}</p>
                          </div>
                          {selectedInterest?.id === area.id && <Zap className="ml-auto text-blue-600 w-4 h-4 fill-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    Expected Level
                  </h3>
                  <div className="space-y-4">
                    {levels.map((level) => (
                      <label key={level.id} className="relative block cursor-pointer group">
                        <input 
                          type="radio" 
                          name="level" 
                          className="peer sr-only" 
                          onChange={() => setSelectedLevel(level)}
                        />
                        <div className="p-5 bg-white border-2 border-slate-100 rounded-2xl transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50/30 group-hover:border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{level.label}</p>
                              <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${selectedLevel?.id === level.id ? "border-blue-600" : "border-slate-200"}`}>
                              <div className={`w-3 h-3 rounded-full bg-blue-600 transition-all ${selectedLevel?.id === level.id ? "scale-100" : "scale-0"}`} />
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {selectedInterest && (
                    <div className="mt-8 p-5 bg-slate-900 rounded-[1.5rem] text-white animate-in slide-in-from-bottom-4 duration-500">
                      <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest relative z-10">Selected Goal</p>
                      <p className="text-sm mt-2 leading-relaxed">
                        Mastering <span className="text-blue-200 font-bold">{selectedInterest.label}</span> 
                        {selectedLevel && <span> at an <span className="text-blue-200 font-bold">{selectedLevel.label}</span> proficiency level.</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                <Link to="/signup/sverify" className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-all">
                   <ChevronLeft className="w-4 h-4" />
                   Back
                </Link>
                
                <button 
                  disabled={!selectedInterest || !selectedLevel || loading}
                  onClick={handleSubmit} 
                  className={`px-12 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                    selectedInterest && selectedLevel 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Start Placement Test
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 3.5s linear forwards;
        }
      `}</style>
    </div>
  );
}