import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  Send,
  CheckCircle,
  Home,
  User,
  BookOpen,
  Calendar,
  ShieldCheck,
  Mail,
  Smartphone,
} from "lucide-react";
import TutorProgressBar from "../tutorprogressbar/tprogress";
import { useNavigate } from "react-router-dom";
import Navbar from "../Topnav";

export default function TutorSignup() {
  const [step, setStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    verificationCode: "",
    selectedSkills: [], // Array for Step 2
    selectedDays: [], // Array for Step 3
    bio: "",
    rate: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // --- MULTI-SELECT TOGGLE LOGIC ---
  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const currentSet = prev[field];
      const isSelected = currentSet.includes(value);
      return {
        ...prev,
        [field]: isSelected
          ? currentSet.filter((item) => item !== value) // Remove if exists
          : [...currentSet, value], // Add if not exists
      };
    });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 0) {
      if (!formData.fullName) newErrors.fullName = "Name is required";
      if (!formData.email.includes("@"))
        newErrors.email = "Valid email required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (formData.verificationCode.length !== 6)
        newErrors.verificationCode = "Enter 6-digit code";
    }
    if (step === 1 && formData.selectedSkills.length === 0) {
      newErrors.selectedSkills = "Select at least one skill";
    }
    if (step === 2) {
      if (formData.selectedDays.length === 0)
        newErrors.selectedDays = "Select at least one day";
      if (!formData.rate) newErrors.rate = "Set your hourly rate";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 3));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
         {/* --- MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-10 mt-12"></main>
        <div className="pt-10 flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full text-center p-12 bg-slate-50 rounded-[3rem] border border-slate-300 shadow-xl">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle size={40} /></div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Application Sent!</h2>
            <p className="text-slate-500 font-medium mb-8">Your profile is now under review by the English Department.</p>
            <button onClick={() => navigate("/")} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><Home size={18} /> Return to Home</button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-x-hidden">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 pt-32 pb-20 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel */}
          <div className="hidden md:flex md:w-1/3 bg-blue-600 p-12 text-white flex-col justify-between relative">
            <div className="relative z-10">
              <h2 className="text-3xl font-black leading-tight mb-4 tracking-tighter">
                Empower the <br />
                next generation.
              </h2>
              <p className="text-blue-100 font-medium opacity-90">
                Join SLIIT's elite circle of English mentors.
              </p>
            </div>
            <div className="relative z-10 mt-8 group">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-auto drop-shadow-2xl transform group-hover:rotate-2 transition-transform duration-500"
              >
                <circle
                  cx="100"
                  cy="70"
                  r="30"
                  fill="white"
                  fillOpacity="0.2"
                />
                <rect
                  x="70"
                  y="50"
                  width="60"
                  height="80"
                  rx="10"
                  fill="white"
                />
                <rect
                  x="80"
                  y="65"
                  width="40"
                  height="4"
                  rx="2"
                  fill="#2563eb"
                />
                <rect
                  x="80"
                  y="75"
                  width="30"
                  height="4"
                  rx="2"
                  fill="#2563eb"
                />
                <circle cx="150" cy="60" r="20" fill="#93c5fd" />
                <path
                  d="M145 60 L155 60 M150 55 L150 65"
                  stroke="white"
                  strokeWidth="3"
                />
              </svg>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-50" />
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-8 md:p-12 bg-white">
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
                />
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-50">
              <button
                onClick={prevStep}
                className={`flex items-center gap-2 font-black text-slate-400 hover:text-blue-600 transition-colors ${step === 0 ? "invisible" : ""}`}
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                onClick={step === 3 ? () => setIsSubmitted(true) : nextStep}
                className={`px-10 py-4 ${step === 3 ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"} text-white rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2`}
              >
                {step === 3 ? "Submit Application" : "Next Step"}{" "}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepContent({
  step,
  formData,
  handleInputChange,
  toggleSelection,
  errors,
}) {
  const variants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 },
  };

  switch (step) {
    case 0:
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">
            Personal Details
          </h3>
          <div className="grid gap-4">
            <InputField
              label="Full Name"
              value={formData.fullName}
              onChange={(v) => handleInputChange("fullName", v)}
              error={errors.fullName}
              icon={<User size={16} />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(v) => handleInputChange("email", v)}
                error={errors.email}
                icon={<Mail size={16} />}
              />
              <InputField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(v) => handleInputChange("phone", v)}
                error={errors.phone}
                icon={<Smartphone size={16} />}
              />
            </div>
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
              <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                Verify Email
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={formData.verificationCode}
                onChange={(e) =>
                  handleInputChange("verificationCode", e.target.value)
                }
                className={`w-full text-center tracking-[1em] text-xl font-black py-4 bg-white rounded-2xl border-2 transition-all outline-none ${errors.verificationCode ? "border-red-400" : "border-blue-100 focus:border-blue-500"}`}
              />
            </div>
          </div>
        </motion.div>
      );
    case 1:
      const skills = [
        "Grammar",
        "IELTS Prep",
        "Academic Writing",
        "Public Speaking",
        "Listening",
        "Vocabulary",
        "Speaking",
      ];
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Expertise</h3>
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Select your areas of expertise (Select Multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const isSelected = formData.selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSelection("selectedSkills", skill)}
                      className={`px-5 py-3 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                          : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              {errors.selectedSkills && (
                <p className="text-[10px] text-red-500 font-bold">
                  {errors.selectedSkills}
                </p>
              )}
            </div>
            <InputField
              label="Professional Bio"
              isTextArea
              value={formData.bio}
              onChange={(v) => handleInputChange("bio", v)}
              placeholder="Describe your experience..."
            />
          </div>
        </motion.div>
      );
    case 2:
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Availability</h3>
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Select Available Days
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {days.map((day) => {
                  const isSelected = formData.selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleSelection("selectedDays", day)}
                      className={`py-4 rounded-xl text-[10px] font-black transition-all active:scale-90 border-2 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                          : "bg-white border-slate-100 text-slate-500 hover:bg-blue-50"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {errors.selectedDays && (
                <p className="text-[10px] text-red-500 font-bold">
                  {errors.selectedDays}
                </p>
              )}
            </div>
            <InputField
              label="Hourly Rate (LKR)"
              type="number"
              value={formData.rate}
              onChange={(v) => handleInputChange("rate", v)}
              error={errors.rate}
              placeholder="e.g. 2500"
            />
          </div>
        </motion.div>
      );
    case 3:
      return (
        <motion.div {...variants} className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Verification</h3>
          <div className="p-10 border-2 border-dashed border-blue-100 bg-blue-50/20 rounded-[2rem] text-center space-y-4 group cursor-pointer hover:bg-blue-50 transition-all">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-black text-blue-900">
                Upload Short teaching video
              </p>
              <p className="text-[10px] text-blue-400 font-bold">
                MP4 or MOV (Max 15MB)
              </p>
            </div>
          </div>
        </motion.div>
      );
    default:
      return null;
  }
}

function InputField({
  label,
  placeholder,
  type = "text",
  isSelect,
  isTextArea,
  value,
  onChange,
  error,
  icon,
}) {
  const classes = `w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl focus:border-blue-400 focus:bg-white transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300 text-sm ${error ? "border-red-400" : "border-slate-50"}`;
  return (
    <div className="space-y-2 relative">
      <div className="flex items-center gap-2 ml-1">
        {icon && <span className="text-slate-400">{icon}</span>}
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
          {label}
        </label>
      </div>
      {isTextArea ? (
        <textarea
          rows={3}
          className={classes}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : isSelect ? (
        <select
          className={classes}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option>{placeholder}</option>
        </select>
      ) : (
        <input
          type={type}
          className={classes}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && (
        <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>
      )}
    </div>
  );
}