import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldCheck,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Navbar from "../Topnav";
import ProgressBar from "../stprogressbar/stpro";
import { useNavigate } from "react-router-dom";

export default function TutorStepOne({ onNext }) {
  const navigate = useNavigate();
  // 1. State for multiple selections
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("idle"); // idle, success, error

  // 2. Eligibility Options
  const eligibilityOptions = [
    {
      id: "level",
      title: "English Proficiency",
      desc: "I have achieved Intermediate (B2) level or higher.",
      detail: "Verified by IELTS 6.5+, TOEFL 75+, or SLIIT Placement.",
    },
    {
      id: "course",
      title: "Completed Coursework",
      desc: "I have successfully finished the required English modules.",
      detail: "Includes Professional Communication or Advanced Grammar.",
    },
    {
      id: "score",
      title: "Performance Score",
      desc: "My current academic performance score is 75% or above.",
      detail: "Based on your latest semester results or test scores.",
    },
  ];

  // 3. Toggle selection logic
  const toggleOption = (id) => {
    if (selectedCriteria.includes(id)) {
      setSelectedCriteria(selectedCriteria.filter((item) => item !== id));
    } else {
      setSelectedCriteria([...selectedCriteria, id]);
    }
  };

  // 4. Handle the "Check Eligibility" button
  const handleCheck = () => {
    setIsVerifying(true);
    // Simulation of a verification delay
    setTimeout(() => {
      if (selectedCriteria.length === eligibilityOptions.length) {
        setVerificationStatus("success");
      } else {
        setVerificationStatus("error");
      }
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      {/* --- MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        {/* PROGRESS BAR */}
        <div className="w-full max-w-4xl mb-10">
          <ProgressBar currentStep={1} />
        </div>

        {/* STEP 1 CARD */}
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Step 01: Eligibility
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              Mentor Requirements
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Select all criteria that apply to your current status.
            </p>
          </div>

          {/* Multiple Selection List */}
          <div className="space-y-3 mb-10">
            {eligibilityOptions.map((option) => {
              const isSelected = selectedCriteria.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`w-full flex items-start text-left p-5 rounded-[2rem] border-2 transition-all duration-300 group ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-500 shadow-lg shadow-blue-500/5"
                      : "bg-slate-50 border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`mt-1 transition-colors duration-300 ${isSelected ? "text-blue-600" : "text-slate-300"}`}
                  >
                    {isSelected ? (
                      <CheckCircle2
                        size={24}
                        fill="currentColor"
                        className="text-white"
                      />
                    ) : (
                      <Circle size={24} />
                    )}
                  </div>

                  <div className="ml-5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-extrabold text-lg transition-colors ${isSelected ? "text-blue-900" : "text-slate-700"}`}
                      >
                        {option.title}
                      </h4>
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${isSelected ? "rotate-90 text-blue-500" : "text-slate-300"}`}
                      />
                    </div>
                    <p
                      className={`text-sm font-medium leading-relaxed mt-1 ${isSelected ? "text-blue-700/80" : "text-slate-500"}`}
                    >
                      {option.desc}
                    </p>
                    {isSelected && (
                      <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-tighter animate-in fade-in slide-in-from-left-2">
                        <Info size={12} /> {option.detail}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Verification Logic */}
          <div className="space-y-4">
            {verificationStatus === "error" && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
                <Info size={18} /> Please select all requirements to continue.
              </div>
            )}

            {verificationStatus !== "success" ? (
              <button
                onClick={handleCheck}
                disabled={isVerifying || selectedCriteria.length === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-lg shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-40"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying Selections...</span>
                  </div>
                ) : (
                  "Check My Eligibility"
                )}
              </button>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="p-4 bg-green-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest">
                  <CheckCircle2 size={20} /> Eligibility Confirmed
                </div>
                <button
                  onClick={() => navigate("/stsignup/mailverify")}
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  Proceed to Skills & Experience <ArrowRight size={22} />
                </button>
              </div>
            )}
          </div>

          <p className="text-center mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <ShieldCheck size={12} /> Secure Application Portal • English Tutor
            2026
          </p>
        </div>
      </main>
    </div>
  );
}
