import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = ["Personal Info", "Qualifications", "Availability", "Verification"];

export default function TutorProgressBar({ currentStep }) {
  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
        {steps.map((label, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                backgroundColor: index <= currentStep ? "#2563eb" : "#f8fafc",
                borderColor: index <= currentStep ? "#2563eb" : "#e2e8f0",
                scale: index === currentStep ? 1.1 : 1,
              }}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-colors"
            >
              {index < currentStep ? <Check size={14} className="text-white" /> : 
              <span className={`text-xs font-bold ${index === currentStep ? "text-white" : "text-slate-400"}`}>{index + 1}</span>}
            </motion.div>
            <span className={`absolute -bottom-6 text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${index <= currentStep ? "text-blue-600" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}