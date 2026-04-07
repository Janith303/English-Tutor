import React, { useState } from "react";
import { 
  ShieldCheck, Mail, CreditCard, Upload, CheckCircle2, 
  Loader2, ArrowLeft, Clock, ExternalLink, Sparkles,
  KeyRound, Edit3, Lock, Eye, EyeOff, User, GraduationCap, School
} from "lucide-react";
import Navbar from "../Topnav";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../stprogressbar/stpro";

// IMPORT YOUR AXIOS SETUP HERE (Adjust the path to match your folder structure)
import privateApi, { publicApi } from "../../api/axios"; // FIX 1: Import both publicApi and privateApi

export default function TutorStepThree({ onBack }) {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Existing States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // States
  const [fullName, setFullName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const passwordsMatch = password === confirmPassword && password !== "";

  // 1. REGISTRATION (Uses publicApi)
  const handleSendOtp = async () => {
    if (!email.includes("@sliit.lk") && !email.includes("@my.sliit.lk")) {
      alert("Please enter a valid SLIIT email address");
      return;
    }

    setLoading(true);
    try {
      const response = await publicApi.post('register/', {
        full_name: fullName,
        email: email,
        password: password,
        university: "SLIIT",
        faculty: faculty,
        academic_year: parseInt(academicYear),
        role: "STUDENT_TUTOR" 
      });

      // Axios automatically throws an error for non-2xx responses, 
      // so if we reach here, it was successful.
      if (response.status === 201) {
        setOtpSent(true);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      // Axios stores backend error messages in error.response.data
      alert(JSON.stringify(error.response?.data || "Failed to connect to the server."));
    } finally {
      setLoading(false);
    }
  };

  // 2. VERIFY OTP & GET LOGIN TOKENS (Uses publicApi)
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await publicApi.post('verify-otp/', {
        email: email,
        code: otp
      });

      if (response.status === 200) {
        setEmailVerified(true);
        // Save tokens for future authenticated requests
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      alert(error.response?.data?.error || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // 3. UPLOAD IDENTITY & MOVE TO NEXT PAGE (Uses privateApi)
  const handleNext = async () => {
    setLoading(true);
    try {
      // Use FormData because we are uploading an image file
      const formData = new FormData();
      formData.append("identity_proof", idFile);
      formData.append("agreed_to_tutor_terms", agreed);

      // Using privateApi! It automatically attaches the Bearer token from localStorage.
      // Axios also handles setting the correct multipart/form-data boundaries automatically.
      const response = await privateApi.put('tutor/verify-identity/', formData);

      if (response.status === 200) {
        navigate("/stsignup/stexperiance");
      }
    } catch (error) {
      console.error("Identity Upload Error:", error);
      alert(JSON.stringify(error.response?.data || "Failed to upload identity document."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      <Navbar />

      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-15%] w-[700px] h-[700px] bg-fuchsia-400/10 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="w-full max-w-4xl mb-12">
          <ProgressBar currentStep={2} />
        </div>

        {isSubmitted ? (
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-10 md:p-16 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative bg-blue-600 text-white p-6 rounded-full inline-block mb-8">
              <Clock size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Application Pending</h2>
            <button onClick={() => navigate("/signup")} className="mt-10 w-full py-5 bg-slate-900 text-white rounded-[1.8rem]">Return to Dashboard</button>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500">
            
            <div className="mb-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles size={12} /> Final Step
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
                <ShieldCheck className="text-blue-600" size={32} /> Identity Verification
              </h2>
            </div>

            <div className="space-y-5">
              
              {/* FULL NAME */}
              <section className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                  <User size={14} className="text-blue-500" /> Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="Enter your full name as per SLIIT records"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
              </section>

              {/* FACULTY & ACADEMIC YEAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                    <School size={14} className="text-blue-500" /> Faculty
                  </label>
                  <select 
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Select Faculty</option>
                    <option value="Computing">Faculty of Computing</option>
                    <option value="Engineering">Faculty of Engineering</option>
                    <option value="Business">Faculty of Business</option>
                  </select>
                </section>

                <section className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                    <GraduationCap size={14} className="text-blue-500" /> Academic Year
                  </label>
                  <select 
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </section>
              </div>

              {/* PASSWORD FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Lock size={12} /> Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-2xl outline-none focus:border-blue-500" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
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
                    className={`w-full px-5 py-3 bg-slate-50 border text-slate-700 rounded-2xl outline-none transition-all ${confirmPassword && !passwordsMatch ? "border-red-400" : "border-slate-100 focus:border-blue-500"}`}
                  />
                </div>
              </div>

              {/* EMAIL AND OTP REQUEST */}
              <section className="space-y-2">
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
                    className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-blue-500 transition-all outline-none disabled:opacity-50"
                  />
                  {!otpSent && !emailVerified && (
                    <button 
                      onClick={handleSendOtp} 
                      disabled={!email || !fullName || !password || !faculty || !academicYear || !passwordsMatch || loading} 
                      className="px-6 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Get OTP"}
                    </button>
                  )}
                </div>
              </section>

              {/* OTP INPUT */}
              {otpSent && !emailVerified && (
                <section className="animate-in slide-in-from-top-4 duration-300">
                  <div className="p-5 bg-blue-50/50 border-2 border-blue-100 rounded-[2rem] flex gap-3">
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="OTP Code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 px-6 py-4 bg-white border-2 border-blue-200 rounded-2xl font-black text-center text-xl text-blue-900 outline-none"
                    />
                    <button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading} className="px-8 bg-blue-600 text-white rounded-2xl font-black transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify"}
                    </button>
                  </div>
                </section>
              )}

              {emailVerified && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 animate-in zoom-in">
                  <CheckCircle2 size={20} />
                  <span className="font-black text-xs uppercase">Student Email Verified</span>
                </div>
              )}

              {/* IDENTITY UPLOAD */}
              <section className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                  <CreditCard size={14} className="text-blue-500" /> Proof of Identity
                </label>
                <label className={`w-full h-24 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${idFile ? "bg-blue-50 border-blue-400" : "bg-slate-50 border-slate-200 hover:border-blue-300"}`}>
                  <input type="file" className="hidden" onChange={(e) => setIdFile(e.target.files[0])} />
                  {idFile ? (
                    <span className="text-blue-900 font-bold text-sm">{idFile.name}</span>
                  ) : (
                    <span className="text-xs font-bold opacity-40">Upload Student ID Front</span>
                  )}
                </label>
              </section>

              {/* AGREEMENT */}
              <label className="flex items-start gap-4 p-4 bg-blue-50/30 rounded-[1.5rem] border border-blue-100 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 rounded border-blue-200 text-blue-600" />
                <p className="text-[10px] font-semibold text-slate-600 leading-relaxed">
                  I certify all details are true and agree to the <span className="text-blue-600 font-black hover:underline">Tutor Agreement</span>.
                </p>
              </label>

            </div>

            {/* FOOTER NAVIGATION */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
              <button onClick={() => navigate("/stsignup/stverify")} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={handleNext} 
                disabled={!emailVerified || !idFile || !agreed || loading}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-blue-700 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Next"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}