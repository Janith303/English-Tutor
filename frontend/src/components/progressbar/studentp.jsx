import React from "react";
// 1. Import the professional icons
import { UserCheck, BookOpen, PenTool, Check } from "lucide-react";

const steps = [
  { id: 1, label: "Verification", icon: UserCheck },
  { id: 2, label: "Interests", icon: BookOpen },
  { id: 3, label: "Placement", icon: PenTool }
];

export default function ProgressBar({ currentStep }) {
  return (
    <div className="w-full max-w-3xl mb-12 px-4">
      <div className="flex justify-between items-center relative">
        {/* Background Line (Inactive) */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-400 -translate-y-1/2 z-0"></div>
        
        {/* Animated Progress Line (Active) */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((item) => {
          // Dynamic Icon Selection
          const Icon = item.icon;
          const isActive = currentStep >= item.id;
          const isCompleted = currentStep > item.id;

          return (
            <div key={item.id} className="relative z-10 flex flex-col items-center">
              {/* Icon Circle */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 transform ${
                isActive 
                  ? "bg-blue-600 border-blue-100 shadow-xl text-white scale-110" 
                  : "bg-slate-200 border-slate-400 text-slate-700"
              }`}>
                {isCompleted ? (
                  <Check className="w-6 h-6 stroke-[3px]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Label */}
              <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-colors duration-500 ${
                isActive ? "text-blue-600" : "text-slate-700"
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}