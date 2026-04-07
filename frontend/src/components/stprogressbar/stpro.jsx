import React from "react";
import { Check, UserCheck, BookOpen, ShieldCheck } from "lucide-react";

const steps = [
  { id: 1, title: "Eligibility", icon: UserCheck },
  { id: 2, title: "Verification", icon: ShieldCheck },
  { id: 3, title: "Skills & Experience", icon: BookOpen },
];

export default function TutorProgressBar({ currentStep }) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12 px-4">
      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1  bg-slate-400 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out rounded-full" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
                ${isCompleted ? "bg-blue-600 text-white scale-110" : 
                  isActive ? "bg-white border-4 border-blue-600 text-blue-600 scale-125" : 
                  "bg-slate-200 border-slate-400 text-slate-700"}
              `}>
                {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
              </div>
              <span className={`absolute -bottom-8 whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? "text-blue-700" : "text-slate-400"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}