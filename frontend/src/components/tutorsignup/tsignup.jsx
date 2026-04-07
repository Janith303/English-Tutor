import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Upload, CheckCircle, Home, User, Mail,
  Lock, Eye, EyeOff, FileVideo, X, School, Loader2, Send
} from "lucide-react";
import TutorProgressBar from "../tutorprogressbar/tprogress";
import { useNavigate } from "react-router-dom";
import Navbar from "../Topnav";
// --- IMPORT YOUR AXIOS INSTANCE ---
import privateApi from "../../api/axios"; 

export default function TutorSignup() {
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "", 
    verificationCode: "",
    password: "",
    confirmPassword: "",
    selectedSkills: [],
    selectedDays: [],
    bio: "",
    rate: "",
    videoFile: null,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const currentSet = prev[field];
      const isSelected = currentSet.includes(value);
      return {
        ...prev,
        [field]: isSelected
          ? currentSet.filter((item) => item !== value)
          : [...currentSet, value],
      };
    });
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 0) {
      if (!formData.fullName) newErrors.fullName = "Name is required";
      if (!formData.email.includes("@")) newErrors.email = "Valid email required";
      if (!formData.university) newErrors.university = "University is required";
      if (!isEmailVerified) newErrors.verificationCode = "Please verify your email first";
      if (!formData.password) newErrors.password = "Password required";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    if (step === 1 && formData.selectedSkills.length === 0) newErrors.selectedSkills = "Select skills";
    if (step === 2 && formData.selectedDays.length === 0) newErrors.selectedDays = "Select days";
    if (step === 3 && !formData.videoFile) newErrors.videoFile = "Video required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- API: SEND OTP ---
  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      alert("Enter a valid email address first.");
      return;
    }
    setOtpLoading(true);
    try {
      await privateApi.post("tutor/send-otp/", { email: formData.email });
      alert("OTP sent to your email!");
    } catch (err) {
      alert("Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // --- API: VERIFY OTP ---
  const handleVerifyEmail = async () => {
    try {
      const response = await privateApi.post("tutor/verify-otp/", {
        email: formData.email,
        otp: formData.verificationCode
      });
      if (response.status === 200) {
        setIsEmailVerified(true);
        alert("Email verified!");
      }
    } catch (err) {
      alert("Invalid verification code.");
    }
  };

  // --- API: FINAL SUBMISSION ---
  const handleFinalSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append("full_name", formData.fullName);
      data.append("email", formData.email);
      data.append("university", formData.university);
      data.append("password", formData.password);
      data.append("role", "TUTOR"); // SETTING ROLE TO TUTOR

      data.append("teaching_areas", JSON.stringify(formData.selectedSkills));
      data.append("availability", JSON.stringify(formData.selectedDays));
      data.append("bio", formData.bio);
      data.append("hourly_rate", formData.rate);
      
      if (formData.videoFile) data.append("video", formData.videoFile);

      const response = await privateApi.post("tutor/register/", data);
      if (response.status === 201) setIsSubmitted(true);
    } catch (err) {
      alert("Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-10 mt-12">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center p-12 bg-slate-50 rounded-[3rem] border border-slate-300 shadow-xl">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">Application Sent!</h2>
              <p className="text-slate-500 font-medium mb-8">SLIIT English Department will review your profile shortly.</p>
              <button onClick={() => navigate("/")} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Return to Home</button>
            </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden">
      <Navbar />
      <main className="relative z-10 pt-32 pb-20 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row">
          <div className="hidden md:w-1/3 bg-blue-600 p-12 text-white md:flex flex-col justify-between">
            <h2 className="text-3xl font-black leading-tight">Empower the <br />next generation.</h2>
            <div className="w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-50" />
          </div>
          <div className="flex-1 p-8 md:p-12">
            <TutorProgressBar currentStep={step} />
            <div className="mt-12 min-h-[440px]">
              <AnimatePresence mode="wait">
                <StepContent
                  key={step}
                  step={step}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  toggleSelection={toggleSelection}
                  errors={errors}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  isEmailVerified={isEmailVerified}
                  handleVerifyEmail={handleVerifyEmail}
                  handleSendOtp={handleSendOtp}
                  otpLoading={otpLoading}
                />
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-50">
              <button onClick={() => setStep(step - 1)} className={`font-black text-slate-400 hover:text-blue-600 ${step === 0 ? "invisible" : ""}`}><ArrowLeft size={18} /> Back</button>
              <button 
                onClick={step === 3 ? handleFinalSubmit : () => { if(validateStep()) setStep(step + 1) }} 
                className={`px-10 py-4 ${step === 3 ? "bg-green-600" : "bg-blue-600"} text-white rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2`}
              >
                {loading ? <Loader2 className="animate-spin" /> : step === 3 ? "Submit" : "Next"} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepContent({ step, formData, handleInputChange, toggleSelection, errors, showPassword, setShowPassword, isEmailVerified, handleVerifyEmail, handleSendOtp, otpLoading }) {
  const fileInputRef = useRef(null);
  const variants = { initial: { opacity: 0, x: 15 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -15 } };
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  switch (step) {
    case 0:
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Personal Details</h3>
          <div className="grid gap-4">
            <InputField label="Full Name" value={formData.fullName} onChange={(v) => handleInputChange("fullName", v)} error={errors.fullName} icon={<User size={16} />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-sm outline-none focus:border-blue-400" />
                  <button type="button" onClick={handleSendOtp} disabled={isEmailVerified || otpLoading} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 disabled:bg-slate-200">
                    {otpLoading ? <Loader2 size={12} className="animate-spin" /> : "Send OTP"}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 ml-1">
                  <School size={16} className="text-slate-400" />
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">University</label>
                </div>
                <select className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none appearance-none ${errors.university ? "border-red-400" : "border-slate-50"}`} value={formData.university} onChange={(e) => handleInputChange("university", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="SLIIT">SLIIT</option>
                  <option value="UOM">UOM</option>
                  <option value="UOP">UOP</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
              <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Verification Code</label>
              <div className="flex gap-2">
                <input type="text" maxLength={6} placeholder="000000" disabled={isEmailVerified} value={formData.verificationCode} onChange={(e) => handleInputChange("verificationCode", e.target.value)} className={`flex-1 text-center tracking-[1em] text-xl font-black py-4 bg-white rounded-2xl border-2 outline-none ${errors.verificationCode ? "border-red-400" : "border-blue-100"}`} />
                <button type="button" onClick={handleVerifyEmail} disabled={isEmailVerified} className={`px-6 font-black rounded-2xl transition-all shadow-md ${isEmailVerified ? "bg-green-100 text-green-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                  {isEmailVerified ? "Verified" : "Verify"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <InputField label="Password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(v) => handleInputChange("password", v)} error={errors.password} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[42px] text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <InputField label="Confirm Password" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(v) => handleInputChange("confirmPassword", v)} error={formData.confirmPassword && !passwordsMatch ? "Mismatch" : null} />
            </div>
          </div>
        </motion.div>
      );
    case 1:
      const skills = ["Grammar", "IELTS Prep", "Academic Writing", "Presentation Skills", "Interview Prep", "Vocabulary"];
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button key={skill} onClick={() => toggleSelection("selectedSkills", skill)} className={`px-5 py-3 rounded-xl text-xs font-bold border-2 transition-all ${formData.selectedSkills.includes(skill) ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"}`}>{skill}</button>
            ))}
          </div>
          <InputField label="Professional Bio" isTextArea value={formData.bio} onChange={(v) => handleInputChange("bio", v)} placeholder="Describe your experience..." />
        </motion.div>
      );
    case 2:
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Availability</h3>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {days.map((day) => (
              <button key={day} onClick={() => toggleSelection("selectedDays", day)} className={`py-4 rounded-xl text-[10px] font-black border-2 transition-all ${formData.selectedDays.includes(day) ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-500 hover:bg-blue-50"}`}>{day}</button>
            ))}
          </div>
          <InputField label="Hourly Rate (LKR)" type="number" value={formData.rate} onChange={(v) => handleInputChange("rate", v)} placeholder="e.g. 2500" />
        </motion.div>
      );
    case 3:
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Verification</h3>
          <div onClick={() => fileInputRef.current.click()} className="p-10 border-2 border-dashed rounded-[2rem] text-center bg-blue-50/20 cursor-pointer hover:bg-blue-50 border-blue-100">
            <Upload className="text-blue-600 mx-auto mb-4" />
            <p className="text-sm font-black text-blue-900">{formData.videoFile ? formData.videoFile.name : "Upload Intro Video"}</p>
            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={(e) => handleInputChange("videoFile", e.target.files[0])} />
          </div>
        </motion.div>
      );
    default: return null;
  }
}

function InputField({ label, placeholder, type = "text", isTextArea, value, onChange, error, icon }) {
  const classes = `w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm transition-all focus:border-blue-400 ${error ? "border-red-400" : "border-slate-50"}`;
  return (
    <div className="space-y-2 relative">
      <div className="flex items-center gap-2 ml-1">
        {icon && <span className="text-slate-400">{icon}</span>}
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
      </div>
      {isTextArea ? <textarea rows={3} className={classes} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} /> : <input type={type} className={classes} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />}
      {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
}