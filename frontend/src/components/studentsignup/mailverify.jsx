import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Topnav";
import logo from "../images/icon.png"
import ProgressBar from "../progressbar/studentp";

export default function StudentSignUp() {
    const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Email Validation Logic
  const validateEmail = (val) => {
    setEmail(val);
    if (!val.includes("@my.sliit.lk") && val !== "") {
      setError("Please use your university email (e.g., ITXXXX@my.sliit.lk)");
    } else {
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col relative overflow-hidden">
      <Navbar />

   {/* --- NEW LIGHT CRYSTAL MESH BACKGROUND --- */}
<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
  
  {/* 1. Top Left - Soft Electric Blue (Higher Opacity) */}
  <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[80px]" />

  {/* 2. Top Right - Clean Cyan (Slightly more "Blue" feel) */}
  <div className="absolute top-[0%] right-[-5%] w-[600px] h-[600px] bg-cyan-300/25 rounded-full blur-[100px]" />

  {/* 3. Center Left - Subtle Indigo (This adds the "Academic" depth) */}
  <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-[90px]" />

  {/* 4. Bottom Right - Soft Violet (Warmth) */}
  <div className="absolute bottom-[-10%] right-[0%] w-[550px] h-[550px] bg-purple-200/30 rounded-full blur-[110px]" />
  
  {/* 5. Subtle Texture Overlay (Optional: makes it look High-Fidelity) */}
  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
</div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        
        {/* PROGRESS BAR */}
        <ProgressBar currentStep={1} />

        {/* SIGN UP CARD */}
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 animate-in fade-in zoom-in duration-500">
          
          {/* Top Illustration/Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-3xl">
              <img src={logo} alt="SpeakUni" className="h-16 w-auto object-contain" />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">Student Verification</h2>
                <p className="text-slate-500 mt-2">Let's confirm your university status</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase ml-1">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-5 py-3 bg-slate-50 border text-slate-700 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase ml-1">University</label>
                  <select className="w-full px-5 py-3 text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 appearance-none">
                    <option>SLIIT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-900 uppercase ml-1">Faculty</label>
                  <select className="w-full px-5 py-3 text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 cursor-pointer">
                    <option value="" className="text-slate-400">Select Faculty</option>
                    <option>Computing</option>
                    <option>Business</option>
                    <option>Engineering</option>
                    <option>Humanities & Sciences</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-900 uppercase ml-1">Academic Year</label>
                  <select className="w-full px-5 py-3 text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 cursor-pointer">
                    <option value="">Select Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 uppercase ml-1">University Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    placeholder="IT21XXXX@my.sliit.lk" 
                    className={`w-full px-5 py-3 text-slate-900 bg-slate-50 border rounded-2xl outline-none transition-all ${error ? "border-red-400 ring-2 ring-red-100" : "border-slate-200 focus:border-blue-500"}`}
                  />
                  {email && !error && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">✓</span>}
                </div>
                {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <input type="text" placeholder="Verification Code" className="w-full px-5 text-slate-700 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                </div>
                <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95">
                  Send Code
                </button>
              </div>

              <button 
                onClick={() => setIsVerified(true)}
                className={`w-full py-4 font-black rounded-2xl transition-all shadow-lg ${isVerified ? "bg-green-500 text-white shadow-green-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"}`}
              >
                {isVerified ? "Status: Verified ✅" : "Verify Account"}
              </button>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-10 pt-6 border-t border-slate-500  flex justify-between items-center">
            <button 
               disabled={step === 1}
               onClick={() => setStep(step - 1)}
               className="text-slate-400 font-bold hover:text-slate-600 disabled:opacity-0 transition-all"
            >
              Back
            </button>
            <button 
              disabled={!isVerified}
              onClick={() => navigate("/signup/interests")}
              className={`px-10 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
                isVerified ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Next Step
            </button>
          </div>
        </div>

        <p className="mt-8 text-slate-500 text-sm">
          Secured by English Tutor Academic Verification System
        </p>
      </main>
    </div>
  );
}