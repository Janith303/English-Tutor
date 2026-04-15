import React, { useState, useRef } from "react";
import { 
  BookOpen, Upload, Clock, MessageSquare, Plus, X, Check,
  ArrowRight, ArrowLeft, Calendar, FileVideo, AlertCircle,
  Sparkles, ShieldCheck, CheckCircle2, Loader2 
} from "lucide-react";
import Navbar from "../Topnav";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../stprogressbar/stpro";

// --- IMPORT YOUR AXIOS SETUP HERE ---
import privateApi from "../../api/axios"; 

export default function TutorStepTwo() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- States ---
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [loading, setLoading] = useState(false); // Added loading state for API call
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const teachingAreas = ["Grammar", "Academic Writing", "Vocabulary", "IELTS Prep", "Presentation Skills", "Career Interview Prep"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["Morning (8am-12pm)", "Afternoon (12pm-4pm)", "Evening (4pm-8pm)"];

  // --- Handlers ---
  const toggleArea = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const toggleSlot = (day, slot) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const newDaySlots = daySlots.includes(slot) 
        ? daySlots.filter(s => s !== slot) 
        : [...daySlots, slot];
      return { ...prev, [day]: newDaySlots };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(""); 

    if (!file) return;

    const allowedTypes = ["video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Please upload a valid MP4 video.");
      setVideoFile(null);
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File is too large. Maximum size is 20MB.");
      setVideoFile(null);
      return;
    }
    setVideoFile(file);
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const removeFile = (e) => {
    e.stopPropagation();
    setVideoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- BACKEND INTEGRATION ---
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // Must use FormData when sending files
      const formData = new FormData();
      
      // Convert arrays/objects to JSON strings because FormData only accepts strings/files
      formData.append("teaching_areas", JSON.stringify(selectedAreas));
      formData.append("bio", bio);
      formData.append("availability", JSON.stringify(availability)); 
      
      if (videoFile) {
        formData.append("video", videoFile);
      }

      // Make the API call using the private interceptor (attaches token)
      const response = await privateApi.post('tutor/application/', formData);

      if (response.status === 201) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      // Display the specific error from Django if it exists
      alert(JSON.stringify(error.response?.data || "Failed to submit application. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative overflow-hidden font-sans">
      <Navbar />
      
      {/* Mesh Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-400/30 rounded-full blur-[130px]" />
        <div className="absolute top-[-10%] right-[-15%] w-[600px] h-[600px] bg-fuchsia-400/20 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="w-full max-w-4xl mb-10">
          <ProgressBar currentStep={3} />
        </div>

        {isSubmitted ? (
          /* SUCCESS VIEW */
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
              Excellent! Your tutor application has been received. We will verify your credentials within <strong>24-48 hours</strong>.
            </p>

            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-bold">Eligibility check passed</span>
              </div>
              <div className="flex items-center gap-3 text-blue-600 animate-pulse">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-black">Awaiting Administrative Approval</span>
              </div>
            </div>

            <button 
              onClick={() => navigate("/")}
              className="mt-10 w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-lg shadow-xl hover:bg-black transition-all"
            >
              Return to Home
            </button>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="w-full max-w-3xl bg-white/90 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <BookOpen className="text-blue-600" size={32} /> Skills & Experience
              </h2>
              <p className="text-slate-500 font-medium mt-2">Tell us about your teaching strengths and availability.</p>
            </div>

            <div className="space-y-12">
              {/* Teaching Areas */}
              <section className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Check size={14} className="text-blue-500" /> Select Teaching Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {teachingAreas.map(area => (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${
                        selectedAreas.includes(area)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-100 text-slate-500"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </section>

              {/* --- NEW: Weekly Availability Picker --- */}
              <section className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" /> Weekly Availability
                </label>
                <div className="space-y-3">
                  {days.map((day) => (
                    <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <span className="w-24 text-sm font-black text-slate-700 uppercase tracking-tighter">{day}</span>
                      <div className="flex flex-wrap gap-2">
                        {timeSlots.map((slot) => {
                          const isActive = availability[day]?.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => toggleSlot(day, slot)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                                isActive 
                                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" 
                                  : "bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Short Bio */}
              <section className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-500" /> Teaching Motivation
                </label>
                <textarea 
                  placeholder="Why do you want to be a tutor?"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-blue-500"
                />
              </section>

              {/* Video Upload */}
              <section className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Upload size={14} className="text-blue-500" /> Short teaching video 
                </label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/mp4" className="hidden" />
                <div onClick={triggerFileInput} className="p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50 relative">
                  {!videoFile ? (
                    <p className="text-sm font-bold text-slate-600">Click to upload MP4 (Max 20MB)</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-green-700">{videoFile.name}</p>
                      <button onClick={removeFile} className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {fileError && <p className="text-red-500 text-xs font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle size={12}/> {fileError}</p>}
              </section>
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
              <button onClick={() => navigate(-1)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[1.8rem] font-bold">Back</button>
              <button 
                onClick={handleFinalSubmit}
                disabled={selectedAreas.length === 0 || !bio || !videoFile || loading}
                className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.8rem] font-black disabled:opacity-30 flex items-center justify-center gap-3 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : "Submit Application"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}