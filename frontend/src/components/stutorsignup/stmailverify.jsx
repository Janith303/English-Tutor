import React, { useState } from "react";
import { 
  ShieldCheck, 
  Mail, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Clock,
  ExternalLink,
  Sparkles,
  KeyRound,
  Edit3,
  Lock, 
  Eye,  
  EyeOff 
} from "lucide-react";
import Navbar from "../Topnav";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../stprogressbar/stpro";

export default function TutorStepThree({ onBack }) {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Email & OTP States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- ADDED MISSING STATES ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordsMatch = password === confirmPassword && password !== "";
  // ----------------------------

  // File & Agreement States
  const [idFile, setIdFile] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const handleSendOtp = () => {
    if (!email.includes("@sliit.lk") && !email.includes("@my.sliit.lk")) {
      alert("Please enter a valid SLIIT email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setEmailVerified(true);
      setLoading(false);
    }, 1500);
  };

  const handleFinalSubmit = () => {
    // Additional validation for password before submission
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (!passwordsMatch) {
      alert("Passwords do not match");
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-15%] w-[700px] h-[700px] bg-fuchsia-400/10 rounded-full blur-[160px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        
        <div className="w-full max-w-4xl mb-12">
          <ProgressBar currentStep={3} />
        </div>

        {isSubmitted ? (
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-10 md:p-16 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
              <div className="relative bg-blue-600 text-white p-6 rounded-full shadow-xl shadow-blue-200">
                <Clock size={48} strokeWidth={2.5} />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Pending</h2>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest border border-amber-100">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Status: Under Review
            </div>
            
            <p className="text-slate-500 font-medium mt-6 text-lg leading-relaxed">
              Excellent! Your tutor application has been received. The English Department will verify your credentials within <strong>24-48 hours</strong>.
            </p>

            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-bold">Eligibility check passed</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-bold">Skills & Availability recorded</span>
              </div>
              <div className="flex items-center gap-3 text-blue-600 animate-pulse">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-black">Awaiting Administrative Approval</span>
              </div>
            </div>

            <button 
              onClick={() => navigate("/signup")}
              className="mt-10 w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-lg shadow-xl hover:bg-black transition-all transform hover:-translate-y-1"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
            
            <div className="mb-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles size={12} /> Final Step
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                <ShieldCheck className="text-blue-600" size={32} /> Identity Verification
              </h2>
              <p className="text-slate-500 font-medium mt-2">Finalize your application for the Student Tutor role.</p>
            </div>

            <div className="space-y-6">
              
              <section className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                  <Mail size={14} className="text-blue-500" /> University Email
                </label>
                <div className="flex gap-3">
                  <input 
                    type="email" 
                    placeholder="it21xxxxxx@my.sliit.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent || emailVerified}
                    className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none disabled:opacity-50"
                  />
                  {!otpSent && !emailVerified && (
                    <button 
                      onClick={handleSendOtp}
                      disabled={!email || loading}
                      className="px-6 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Get OTP"}
                    </button>
                  )}
                </div>
              </section>

              {otpSent && !emailVerified && (
                <section className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="p-6 bg-blue-50/50 border-2 border-blue-100 rounded-[2rem] space-y-4">
                    <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center justify-between px-2">
                      <span className="flex items-center gap-2"><KeyRound size={14} /> Verification Code</span>
                      <button onClick={() => setOtpSent(false)} className="text-[10px] flex items-center gap-1 hover:underline"><Edit3 size={10}/> Change Email</button>
                    </label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 px-6 py-4 bg-white border-2 border-blue-200 rounded-2xl font-black text-center text-2xl tracking-[0.3em] text-blue-900 outline-none focus:border-blue-500 transition-all"
                      />
                      <button 
                        onClick={handleVerifyOtp}
                        disabled={otp.length < 6 || loading}
                        className="px-8 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {emailVerified && (
                <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-100 rounded-2xl text-green-600 animate-in zoom-in">
                  <CheckCircle2 size={24} />
                  <span className="font-black text-sm uppercase tracking-wider">Student Email Verified</span>
                </div>
              )}

              {/* Password Fields - FIXED */}
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
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

              <section className="space-y-4 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                  <CreditCard size={14} className="text-blue-500" /> Proof of Identity
                </label>
                <label className={`w-full h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  idFile ? "bg-blue-50 border-blue-400 shadow-inner" : "bg-slate-50 border-slate-200 hover:border-blue-300"
                }`}>
                  <input type="file" className="hidden" onChange={(e) => setIdFile(e.target.files[0])} />
                  {idFile ? (
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <CheckCircle2 size={20} className="text-blue-600" /> {idFile.name}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center opacity-40">
                      <Upload size={28} className="text-slate-400" />
                      <p className="text-xs font-bold mt-1 tracking-tight">Upload Student ID Front</p>
                    </div>
                  )}
                </label>
              </section>

              <label className="flex items-start gap-4 p-5 bg-blue-50/30 rounded-[2rem] border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded-md border-blue-200 text-blue-600 focus:ring-blue-500 transition-all" 
                />
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                  I certify that all details provided are true. I agree to follow the 
                  <span className="text-blue-600 font-black cursor-pointer inline-flex items-center gap-1 ml-1 hover:underline">
                    Tutor Agreement <ExternalLink size={10} />
                  </span>.
                </p>
              </label>

            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => navigate("/stsignup/stexperiance")}
                className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.8rem] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={!emailVerified || !idFile || !agreed || !passwordsMatch || password.length < 6}
                className="flex-[2] py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed group active:scale-95"
              >
                Finish & Submit Application
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center gap-4 opacity-40 grayscale">
             <div className="h-px w-12 bg-slate-300" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Excellence</span>
             <div className="h-px w-12 bg-slate-300" />
        </div>
      </main>
    </div>
  );
}