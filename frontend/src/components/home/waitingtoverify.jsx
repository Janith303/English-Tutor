import React from "react";
import { useNavigate } from "react-router-dom";
// Standard icons used in your success view
import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "../Topnav";

// If you are using this as a standalone component,
// make sure to export it and pass the navigate hook inside.

export default function ApplicationSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative overflow-hidden font-sans">
      <Navbar />
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-20">
        {/* --- SUCCESS VIEW --- */}
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-white rounded-[3rem] shadow-2xl p-10 md:p-16 text-center animate-in fade-in zoom-in duration-700">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
            <div className="relative bg-blue-600 text-white p-6 rounded-full shadow-xl shadow-blue-200">
              <Clock size={48} strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Application Pending
          </h2>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-widest border border-amber-100">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Status: Under Review
          </div>

          <p className="text-slate-500 font-medium mt-6 text-lg leading-relaxed">
            Excellent! Your tutor application has been received. We will verify
            your credentials within <strong>24-48 hours</strong>.
          </p>

          <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <CheckCircle2 size={18} className="text-green-500" />
              <span className="text-sm font-bold">
                Eligibility check passed
              </span>
            </div>
            <div className="flex items-center gap-3 text-blue-600 animate-pulse">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-black">
                Awaiting Administrative Approval
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-10 w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
