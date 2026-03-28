import React from "react";
import { Link } from "react-router-dom";
// 1. Import the icon from lucide-react
import { GraduationCap } from "lucide-react"; 

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] text-white py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* Updated Icon Container */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            {/* 2. Added GraduationCap with specific color and size */}
            <GraduationCap className="text-blue-400 w-8 h-8" />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Ready to speak like a pro?
        </h2>

        <p className="text-xl text-blue-200 mb-10 max-w-lg mx-auto font-medium">
          Join thousands of university students already improving their English every day.
        </p>

        <Link
          to="/signup"
          className="inline-block px-12 py-5 bg-[#2563EB] text-white text-2xl font-bold rounded-3xl hover:bg-[#1D4ED8] transition transform hover:-translate-y-1 shadow-xl shadow-blue-900/30"
        >
          Create Free Account →
        </Link>

        {/* Updated Footer Text to reflect your specific SLIIT context */}
        <p className="mt-12 text-sm text-blue-300 font-medium">
          © {new Date().getFullYear()} SpeakUni English Dept • SLIIT Student Developers
        </p>
      </div>
    </footer>
  );
}