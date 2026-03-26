import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Topnav";
import logo from "../images/icon.png";
import ProgressBar from "../progressbar/studentp";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  School, 
  Zap, 
  CheckCircle2, 
  Info,
  ShieldCheck
} from "lucide-react";

export default function StudentSignUp() {
  const navigate = useNavigate();
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Email Validation Logic for SLIIT
  const validateEmail = (val) => {
    setEmail(val);
    if (!val.includes("@my.sliit.lk") && val !== "") {
      setError("Please use your SLIIT email (e.g., ITXXXX@my.sliit.lk)");
    } else {
      setError("");
    }
  };

  // Timer Logic for Resending Code
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = () => {
    if (!email.includes("@my.sliit.lk")) return;
    // Here you would trigger your Backend API call
    setCodeSent(true);
    setTimer(60); 
  };

  const passwordsMatch = password !== "" && password === confirmPassword;

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      {/* --- MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-175 h-175 bg-cyan-400/30 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-15%] w-200 h-200 bg-fuchsia-400/20 rounded-full blur-[160px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        
        <ProgressBar currentStep={1} />

        {/* SIGN UP CARD */}
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-12 animate-in fade-in zoom-in duration-500">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 shadow-sm">
              <img src={logo} alt="SpeakUni" className="h-14 w-auto object-contain" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Verification</h2>
              <p className="text-slate-500 mt-2 font-medium">Create your secure academic account</p>
            </div>

            {/* Row 1: Name & University */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                  <User size={12} /> Full Name
                </label>
                <input type="text" placeholder="John Doe" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                  <School size={12} /> University
                </label>
                <select className="w-full px-5 py-3 text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none cursor-not-allowed">
                  <option>SLIIT</option>
                </select>
              </div>
            </div>

            {/* Row 2: Faculty & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Faculty</label>
                <select className="w-full px-5 py-3 text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 cursor-pointer">
                  <option value="">Select Faculty</option>
                  <option>Computing</option>
                  <option>Business</option>
                  <option>Engineering</option>
                  <option>Humanities & Sciences</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Academic Year</label>
                <select className="w-full px-5 py-3 text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 cursor-pointer">
                  <option value="">Select Year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                <Mail size={12} /> University Email
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  placeholder="ITXXXXXX@my.sliit.lk" 
                  className={`w-full px-5 py-3 text-slate-900 bg-slate-50 border rounded-2xl outline-none transition-all ${error ? "border-red-400 ring-4 ring-red-50" : "border-slate-100 focus:border-blue-500"}`}
                />
                {email && !error && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
              </div>
              {error && <p className="text-red-500 text-[10px] mt-1 font-bold flex items-center gap-1"><Info size={10}/> {error}</p>}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                  <Lock size={12} /> Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl outline-none focus:border-blue-500 transition-all" 
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Confirm Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className={`w-full px-5 py-3 bg-slate-50 border text-slate-700 rounded-2xl outline-none transition-all ${confirmPassword && !passwordsMatch ? "border-red-400 ring-4 ring-red-50" : "border-slate-100 focus:border-blue-500"}`}
                />
              </div>
            </div>

            {/* VERIFICATION CODE SECTION (Dynamic) */}
            <div className="mt-4">
              {!codeSent ? (
                <button 
                  onClick={handleSendCode}
                  disabled={!email.includes("@my.sliit.lk")}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap size={18} className="text-blue-400 fill-blue-400" />
                  Send Verification Code
                </button>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="6-Digit Code" 
                      className="flex-1 px-5 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 font-mono text-center tracking-widest text-lg rounded-2xl outline-none focus:border-blue-600 transition-all" 
                    />
                    <button 
                      disabled={timer > 0}
                      onClick={handleSendCode}
                      className="px-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl text-xs hover:bg-slate-50 disabled:opacity-50"
                    >
                      {timer > 0 ? `Resend ${timer}s` : "Resend"}
                    </button>
                  </div>
                  <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1 px-1">
                    <Info size={12} /> Check your SLIIT Outlook (Check Junk Folder if not found)
                  </p>
                </div>
              )}
            </div>

            {/* Final Verify Button */}
            <button 
              onClick={() => setIsVerified(true)}
              disabled={!codeSent}
              className={`w-full py-4 font-black rounded-2xl transition-all shadow-xl transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                isVerified 
                ? "bg-green-500 text-white" 
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:grayscale"
              }`}
            >
              {isVerified ? <><CheckCircle2 size={20} /> Verified</> : <><ShieldCheck size={20} /> Verify & Complete</>}
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Step 1/3</span>
            <button 
              disabled={!isVerified}
              onClick={() => navigate("/signup/interests")}
              className={`px-10 py-3 rounded-2xl font-black transition-all transform hover:scale-105 active:scale-95 ${
                isVerified ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
            >
              Next Step
            </button>
          </div>
        </div>

        <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <Lock size={10} /> SpeakUni Academic Shield • SLIIT-Only Access
        </p>
      </main>
    </div>
  );
}