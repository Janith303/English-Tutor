import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Topnav";

// Data for our three distinct roles
const roles = [
  {
    title: "Student",
    tagline:
      "Improve your academic English for essays, lectures, and research.",
    img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200",
    alt: "Student studying with a laptop",
    path: "/signup/sverify",
  },
  {
    title: "Student Tutor",
    tagline:
      "A SLIIT student? Mentor peers and sharpen your own communication skills.",
    img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600",
    path: "/stsignup/stverify",
  },
  {
    title: "Tutor",
    tagline:
      "An English expert or academic? Join our network to teach global scholars.",
    img: "https://images.unsplash.com/photo-1758270704587-43339a801396?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    path: "/tutor/stverify",
  },
];

export default function SignUp() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden">
      <Navbar />

      {/* --- VIBRANT LIGHT MESH GRADIENT BLOBS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Left - Bright Electric Cyan/Blue */}
        <div className="absolute top-[-20%] left-[-10%] w-175 h-175 bg-cyan-400/40 rounded-full blur-[130px] animate-pulse" />

        {/* Top Right - Soft Neon Purple/Magenta */}
        <div className="absolute top-[-10%] right-[-15%] w-200 h-200 bg-fuchsia-400/30 rounded-full blur-[160px]" />

        {/* Center Right - Vibrant Royal Blue */}
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[140px]" />

        {/* Bottom Left - Soft Pastel Pink/Rose */}
        <div className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-pink-400/30 rounded-full blur-[120px]" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center py-12 md:py-20 px-6">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
            Choose Your <span className="text-blue-600">English</span> Path
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            Select your role to get started
          </p>
        </div>

        {/* 3-Card Grid: Stacks on mobile, side-by-side on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          {roles.map((role) => (
            <div
              key={role.title}
              className="group rounded-3xl border border-slate-100 bg-white p-3 shadow-lg md:shadow-xl hover:shadow-2xl hover:border-blue-200 transform hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              {/* Role Image: Aspect-video ensures consistency */}
              <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-8 shadow-inner border border-blue-50">
                <img
                  src={role.img}
                  alt={role.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Role Details */}
              <div className="flex-1 flex flex-col space-y-4 mb-10">
                <h3 className="text-3xl font-black text-blue-950 tracking-tight">
                  {role.title}
                </h3>
                <p className="text-lg text-blue-900 leading-relaxed max-w-sm">
                  {role.tagline}
                </p>
              </div>

              {/* Action Button */}
              <Link to={role.path} className="block w-full">
                <button
                  className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl 
               hover:bg-blue-700 transition shadow-lg active:scale-95 transform 
               group-hover:shadow-blue-200 group-hover:shadow-xl"
                >
                  Sign Up as {role.title}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Login Link */}
        <p className="mt-12 text-center text-blue-950 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </main>
    </div>
  );
}
