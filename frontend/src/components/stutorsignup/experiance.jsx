import React, { useState } from "react";
import { 
  BookOpen, 
  Upload, 
  Clock, 
  MessageSquare, 
  Plus, 
  X, 
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar
} from "lucide-react";
import Navbar from "../Topnav";
import { useNavigate, Link } from "react-router-dom";
import ProgressBar from "../stprogressbar/stpro";

export default function TutorStepTwo({ onNext, onBack }) {
  // --- States ---
  const navigate = useNavigate();
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState({}); // Example: { Monday: ["Morning", "Evening"] }

  const teachingAreas = ["Grammar", "Academic Writing",  "Vocabulary", "IELTS Prep", "Presentation Skills", "Career Interview Prep"];
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative overflow-hidden font-sans">
      <Navbar />
      
      {/* --- MESH BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-175 h-175 bg-cyan-400/30 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-15%] w-200 h-200 bg-fuchsia-400/20 rounded-full blur-[160px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[140px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="w-full max-w-4xl mb-10">
          <ProgressBar currentStep={2} />
        </div>

        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="text-blue-600" size={32} /> Skills & Experience
            </h2>
            <p className="text-slate-500 font-medium mt-2">Tell us about your teaching strengths and availability.</p>
          </div>

          <div className="space-y-12">
            
            {/* 1. Teaching Areas (Tag Cloud) */}
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
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-200"
                    }`}
                  >
                    {selectedAreas.includes(area) && <Check size={14} className="inline mr-2" />}
                    {area}
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Short Bio / Motivation */}
            <section className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-500" /> Teaching Motivation
              </label>
              <textarea 
                placeholder="Why do you want to be a tutor? Mention your previous experience..."
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
              />
            </section>

            {/* 3. Availability Selection Grid */}
            <section className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" /> Weekly Availability
              </label>
              <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
                <table className="w-full text-left bg-slate-50/50">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="p-4 text-[10px] font-black text-slate-400">DAY</th>
                      {timeSlots.map(slot => (
                        <th key={slot} className="p-4 text-[10px] font-black text-slate-400">{slot.split(" ")[0]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      <tr key={day} className="border-b border-slate-100 last:border-0">
                        <td className="p-4 font-bold text-slate-700 text-sm">{day}</td>
                        {timeSlots.map(slot => {
                          const isSelected = availability[day]?.includes(slot);
                          return (
                            <td key={slot} className="p-2">
                              <button 
                                onClick={() => toggleSlot(day, slot)}
                                className={`w-full h-10 rounded-xl transition-all flex items-center justify-center ${
                                  isSelected ? "bg-blue-500 text-white shadow-md" : "bg-white border border-slate-200 text-slate-300 hover:border-blue-300"
                                }`}
                              >
                                {isSelected ? <Check size={16} /> : <Plus size={16} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Supporting Documents */}
            <section className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Upload size={14} className="text-blue-500" /> Short teaching video 
              </label>
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center group hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer">
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                   <Upload className="text-blue-600" size={24} />
                </div>
                <p className="text-sm font-bold text-slate-600">Upload teaching video</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-tighter"> MP4 (Max 20MB)</p>
              </div>
            </section>

          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => navigate("/stsignup/stverify")}
              className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[1.8rem] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button 
              onClick={() => navigate("/stsignup/mailverify")}
              disabled={selectedAreas.length === 0 || !bio}
              className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-lg shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-30 group"
            >
              Submit Application
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <p className="mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
          English Tutor • Student Tutor Onboarding 2026
        </p>
      </main>
    </div>
  );
}