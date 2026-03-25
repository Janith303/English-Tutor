import React, { useState } from "react";
import Navbar from "../Topnav";
import { Link } from "react-router-dom";
import ProgressBar from "../progressbar/studentp";  

const interestAreas = [
  { id: "writing", label: "Academic Writing", icon: "✍️", desc: "Essays & Research" },
  { id: "speaking", label: "Presentation Skills", icon: "🎤", desc: "Public Speaking" },
  { id: "career", label: "Interview Prep", icon: "💼", desc: "Job Readiness" },
  { id: "grammar", label: "Grammar & Flow", icon: "🧩", desc: "Sentence Structure" },
  { id: "vocab", label: "Vocabulary", icon: "📚", desc: "Academic Lexicon" },
];

const levels = [
  { id: "beg", label: "Beginner", desc: "Basic communication" },
  { id: "int", label: "Intermediate", desc: "Standard academic flow" },
  { id: "adv", label: "Advanced", desc: "Complex research level" },
];

export default function StudentSignUpStep2() {
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
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">1</span>
                Focus Area
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {interestAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedInterest(area)}
                    className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                      selectedInterest?.id === area.id 
                      ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50" 
                      : "border-slate-100 bg-white hover:border-blue-200"
                    }`}
                  >
                    <span className="text-2xl mr-4">{area.icon}</span>
                    <div>
                      <p className={`font-bold ${selectedInterest?.id === area.id ? "text-blue-700" : "text-slate-800"}`}>{area.label}</p>
                      <p className="text-xs text-slate-500">{area.desc}</p>
                    </div>
                    {selectedInterest?.id === area.id && <span className="ml-auto text-blue-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Proficiency Level */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">2</span>
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
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                          <div className={`w-3 h-3 rounded-full bg-blue-600 transition-all ${selectedLevel?.id === level.id ? "scale-100" : "scale-0"}`} />
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* DYNAMIC SUMMARY AREA */}
              {selectedInterest && (
                <div className="mt-8 p-4 bg-slate-900 rounded-2xl text-white animate-in slide-in-from-bottom-4 duration-500">
                  <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Selected Goal</p>
                  <p className="text-sm mt-1">
                    Mastering <span className="font-bold">{selectedInterest.label}</span> 
                    {selectedLevel && <span> at an <span className="font-bold">{selectedLevel.label}</span> proficiency.</span>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER NAV */}
          <div className="mt-12 pt-8 border-t border-slate-500 flex justify-between items-center">
            <Link to="/signup/sverify" className="text-slate-400 font-bold hover:text-slate-600 transition-all">
            <button className="text-slate-400 font-bold hover:text-slate-600 transition-all">
              Back to Verification
            </button>
            </Link>
            <button 
              disabled={!selectedInterest || !selectedLevel}
              className={`px-12 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 ${
                selectedInterest && selectedLevel 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Start Placement Test
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}