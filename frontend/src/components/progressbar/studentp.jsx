import React from "react";

const steps = [
  { id: 1, label: "Verification", icon: "🎓" },
  { id: 2, label: "Interests", icon: "📚" },
  { id: 3, label: "Placement", icon: "✍️" }
];

export default function ProgressBar({ currentStep }) {
  return (
    <div className="w-full max-w-3xl mb-12">
      <div className="flex justify-between items-center relative">
        {/* Gray Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-400 -translate-y-1/2 z-0"></div>
        
        {/* Blue Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((item) => (
          <div key={item.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 transition-all duration-500 ${
              currentStep >= item.id 
                ? "bg-blue-600 border-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] text-white" 
                : "bg-slate-400 border-slate-800 text-slate-500"
            }`}>
              {item.id < currentStep ? "✓" : item.icon}
            </div>
            <span className={`mt-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-500 ${
              currentStep >= item.id ? "text-blue-600" : "text-slate-400"
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}