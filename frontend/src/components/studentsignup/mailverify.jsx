import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api/axios"; 
import Navbar from "../Topnav";
import logo from "../images/icon.png";
import ProgressBar from "../progressbar/studentp";
import { 
  Lock, Eye, EyeOff, Mail, User, School, Zap, 
  CheckCircle2, Info, ShieldCheck, Loader2, Check, X 
} from "lucide-react"; // Added Check and X

export default function StudentSignUp() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: "",         
    faculty: "",
    academicYear: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  // --- NEW: Password Validation State ---
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });

  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- UPDATED: handleChange to include validation logic ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "email") validateEmail(value);

    // Run password validation real-time
    if (name === "password") {
      setValidations({
        length: value.length >= 6,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }
  };

  const validateEmail = (val) => {
    if (!val.includes("@my.sliit.lk") && val !== "") {
      setError("Please use your SLIIT email (e.g., itXXXX@my.sliit.lk)");
    } else {
      setError("");
    }
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = async () => {
    if (!formData.email.includes("@my.sliit.lk")) return;
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await publicApi.post("register/", {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        university: "SLIIT",
        faculty: formData.faculty,
        academic_year: parseInt(formData.academicYear) || 1,
        role: "STUDENT" 
      });

      setCodeSent(true);
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 6) return;
    setLoading(true);
    setError("");

    try {
      const response = await publicApi.post("verify-otp/", {
        email: formData.email,
        code: otpCode
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user_role", response.data.role);
      
      setIsVerified(true);
    } catch (err) {
      setError("Invalid or expired code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password !== "" && formData.password === formData.confirmPassword;
  const isPasswordValid = Object.values(validations).every(Boolean);

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col relative overflow-hidden font-sans text-slate-900">
      <Navbar />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-175 h-175 bg-cyan-400/30 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-15%] w-200 h-200 bg-fuchsia-400/20 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <ProgressBar currentStep={1} />

        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
              <img src={logo} alt="SpeakUni" className="h-14 w-auto" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Verification</h2>
              <p className="text-slate-500 mt-2 font-medium">Create your secure academic account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 animate-pulse">
                <Info size={16} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><User size={12} /> Full Name</label>
                <input 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><School size={12} /> University</label>
                <select className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none cursor-not-allowed" disabled><option>SLIIT</option></select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Faculty</label>
                <select name="faculty" value={formData.faculty} onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500">
                  <option value="">Select Faculty</option>
                  <option value="Computing">Computing</option>
                  <option value="Business">Business</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Academic Year</label>
                <select name="academicYear" value={formData.academicYear} onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500">
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Mail size={12} /> University Email</label>
              <div className="relative">
                <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="itXXXXXX@my.sliit.lk" className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none transition-all ${error && formData.email ? "border-red-400" : "border-slate-100 focus:border-blue-500"}`} />
                {formData.email && !error && formData.email.includes("@my.sliit.lk") && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Lock size={12} /> Password</label>
                <div className="relative">
                  <input 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none transition-all ${formData.password.length > 0 ? (isPasswordValid ? "border-green-400" : "border-red-300") : "border-slate-100 focus:border-blue-500"}`} 
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Confirm Password</label>
                <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="••••••••" className={`w-full px-5 py-3 bg-slate-50 border rounded-2xl outline-none ${formData.confirmPassword && !passwordsMatch ? "border-red-400" : "border-slate-100 focus:border-blue-500"}`} />
              </div>
            </div>

            {/* --- NEW: Validation Checklist UI --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-1">
              <ValidationNote isMet={validations.length} label="6+ Chars" />
              <ValidationNote isMet={validations.upper} label="Uppercase" />
              <ValidationNote isMet={validations.lower} label="Lowercase" />
              <ValidationNote isMet={validations.number} label="Number" />
            </div>

            {!codeSent ? (
              <button 
                onClick={handleSendCode}
                disabled={loading || !formData.email.includes("@my.sliit.lk") || !passwordsMatch || !isPasswordValid}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Zap size={18} className="text-blue-400 fill-blue-400" /> Send Verification Code</>}
              </button>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    placeholder="6-Digit Code" 
                    className="flex-1 px-5 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 font-mono text-center tracking-widest text-lg rounded-2xl outline-none focus:border-blue-600" 
                  />
                  <button onClick={handleVerifyOTP} disabled={loading || otpCode.length < 6 || isVerified} className="px-6 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {loading ? <Loader2 className="animate-spin" /> : "Verify"}
                  </button>
                </div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><Info size={12} /> Check your SLIIT Outlook</p>
                   <button onClick={handleSendCode} disabled={timer > 0} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-tighter">
                      {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                   </button>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Step 1/3</span>
              <button 
                disabled={!isVerified}
                onClick={() => navigate("/signup/interests")}
                className={`px-10 py-3 rounded-2xl font-black transition-all transform active:scale-95 ${isVerified ? "bg-slate-900 text-white shadow-xl hover:scale-105" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENT ---
function ValidationNote({ isMet, label }) {
  return (
    <div className={`flex items-center gap-2 ${isMet ? "opacity-100" : "opacity-40"}`}>
      {isMet ? <Check size={12} className="text-green-500 stroke-[4px]" /> : <X size={12} className="text-gray-300 stroke-[4px]" />}
      <span className={`text-[10px] font-black uppercase tracking-tight ${isMet ? "text-green-600" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}