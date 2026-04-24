import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, KeyRound } from "lucide-react";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Enter OTP & New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const API_BASE = "http://127.0.0.1:8000/api";

  // Step 1: Request the OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await axios.post(`${API_BASE}/password-reset/request/`, { email });
      setStep(2);
      setMessage("An OTP has been sent to your email address.");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE}/password-reset/confirm/`, { 
        email, 
        code, 
        password: newPassword 
      });
      setMessage("Password successfully reset! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to reset password. Please check your code.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-slate-500 font-medium mt-2">
            {step === 1 ? "Enter your email to receive a recovery code." : "Enter the code and your new password."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-bold text-center">
            {message}
          </div>
        )}

        {/* STEP 1 FORM: Ask for Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@university.edu"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Recovery Code"} <ArrowRight size={20} />
            </button>
          </form>
        )}

        {/* STEP 2 FORM: Ask for OTP and New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">6-Digit Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength="6"
                  placeholder="123456"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-black text-slate-700 tracking-widest outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="8"
                  placeholder="Create a new password"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
              >
                Didn't receive the code? Try again.
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-8 pt-6 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-500">
            Remember your password? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}