import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Topnav";
import ProgressBar from "../progressbar/studentp";
// 1. Import professional icons
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
} from "lucide-react";

const interestAreas = [
  {
    id: "writing",
    label: "Academic Writing",
    icon: PenTool,
    desc: "Essays & Research",
  },
  {
    id: "speaking",
    label: "Presentation Skills",
    icon: Mic2,
    desc: "Public Speaking",
  },
  {
    id: "career",
    label: "Interview Prep",
    icon: Briefcase,
    desc: "Job Readiness",
  },
  {
    id: "grammar",
    label: "Grammar & Flow",
    icon: Puzzle,
    desc: "Sentence Structure",
  },
  {
    id: "vocab",
    label: "Vocabulary",
    icon: BookText,
    desc: "Academic Lexicon",
  },
];

const levels = [
  { id: "beg", label: "Beginner", desc: "Basic communication" },
  { id: "int", label: "Intermediate", desc: "Standard academic flow" },
  { id: "adv", label: "Advanced", desc: "Complex research level" },
];

export default function StudentSignUpStep2() {
  const navigate = useNavigate();
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      {/* --- MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-12">
        
        <ProgressBar currentStep={2} />

        {/* MAIN CARD */}
        <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-12 animate-in fade-in zoom-in duration-500">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900">Personalize Your Journey</h2>
            <p className="text-slate-500 mt-2 font-medium">This helps us tailor your English learning experience</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT: Interests */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                Focus Area
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {interestAreas.map((area) => {
                  const Icon = area.icon; // Get the component
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

            {/* RIGHT: Proficiency Level */}
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

              {/* DYNAMIC SUMMARY AREA */}
              {selectedInterest && (
                <div className="mt-8 p-5 bg-slate-900 rounded-[1.5rem] text-white animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                  <Target className="absolute -right-4 -top-4 w-20 h-20 text-white/5 rotate-12" />
                  <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest relative z-10">Selected Goal</p>
                  <p className="text-sm mt-2 leading-relaxed relative z-10">
                    Mastering <span className="text-blue-200 font-bold">{selectedInterest.label}</span> 
                    {selectedLevel && <span> at an <span className="text-blue-200 font-bold">{selectedLevel.label}</span> proficiency level.</span>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER NAV */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
            <Link to="/signup/sverify" className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-all">
               <ChevronLeft className="w-4 h-4" />
               Back to Verification
            </Link>
            
            <button 
              disabled={!selectedInterest || !selectedLevel}
              onClick={() => navigate("/signup/test")}
              className={`px-12 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                selectedInterest && selectedLevel 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Start Placement Test
              <Zap className={`w-5 h-5 ${selectedInterest && selectedLevel ? "text-blue-200" : "text-slate-400"}`} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
