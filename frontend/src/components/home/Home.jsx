import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  LineChart, 
  MessageSquare, 
  Search, 
  PlayCircle,
  Sparkles,
  Zap,
  Star
} from "lucide-react";
import Navbar from "../Topnav"; 
import Footer from "../Footer";

const sliderImages = [
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200", 
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200", 
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200", 
];

export default function Home() {
 const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };
  

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      {/* 1. Image Slider Section (Top) */}
      <section className="bg-gray-50 pt-16 pb-6"> 
        <div className="w-full mx-auto"> 
          <div className="relative w-full h-[400px] md:h-[550px] overflow-hidden shadow-lg border-b border-blue-100"> 
            {sliderImages.map((img, index) => ( 
              <img 
                key={index} 
                src={img} 
                alt={`University moment ${index + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`} 
              /> 
            ))} 
            
            {/* Overlay Gradient */} 
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent" /> 
            
            {/* Dynamic Text */} 
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white text-left"> 
              <p className="text-2xl md:text-4xl font-black tracking-tight"> 
                {currentSlide === 0 && "Interactive Study Groups"} 
                {currentSlide === 1 && "Lectures & Seminars"} 
                {currentSlide === 2 && "Global Research Presentations"} 
              </p> 
            </div> 
          </div> 
        </div> 
      </section>
      

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-xs font-black text-blue-600 uppercase tracking-widest shadow-sm">
              <Sparkles size={14} /> New: AI Writing Assistant 2.0
            </div>

            <h1 className="text-5xl md:text-8xl font-black leading-[1.05] text-slate-900 tracking-tight">
              Master <span className="text-blue-600">English.</span> <br />
              Lead at <span className="relative inline-block">
                SLIIT.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                   <path d="M0,10 Q50,20 100,10" stroke="#2563eb" strokeWidth="4" fill="transparent" />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
              The only platform designed specifically for SLIIT IT students to bridge the gap between technical expertise and professional communication.
            </p>

            <div className="flex flex-wrap gap-5">
              <button className="px-10 py-5 bg-blue-600 text-white text-lg font-black rounded-2xl hover:bg-blue-700 transition shadow-2xl shadow-blue-200 hover:-translate-y-1 active:scale-95 flex items-center gap-3">
                Get Started <ArrowRight size={20} />
              </button>
              <button className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-700 text-lg font-black rounded-2xl hover:bg-slate-50 transition active:scale-95 flex items-center gap-3 shadow-sm">
                <PlayCircle size={20} /> Become a Tutor
              </button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400">Joined by 500+ SLIIT Students</p>
            </div>
          </motion.div>

          {/* Hero Visual - Interactive Slider */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative z-10 w-full h-[500px] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white/50 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={sliderImages[currentSlide]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-sm font-black uppercase tracking-[0.3em] mb-2 text-blue-400">Student Life</p>
                <h3 className="text-3xl font-black italic">Collaborate. Grow. Succeed.</h3>
              </div>
            </div>
            {/* Floating Achievement Card */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 z-20 flex items-center gap-4"
            >
              <div className="bg-green-100 p-3 rounded-2xl text-green-600"><Zap size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">CEFR Progress</p>
                <p className="text-xl font-black text-slate-900">B2 → C1 Level</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- PLATFORM FEATURES --- */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Built for Academic Success</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Unleash your full potential</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Placement Test", icon: <Search />, desc: "Instantly detect your CEFR level and grammar weak spots.", color: "bg-blue-600" },
              { title: "Tutor System", icon: <Users />, desc: "Get personalized 1-on-1 sessions from senior SLIIT tutors.", color: "bg-indigo-600" },
              { title: "Smart Dashboard", icon: <LineChart />, desc: "Track every skill from academic writing to public speaking.", color: "bg-purple-600" },
              { title: "Q&A Community", icon: <MessageSquare />, desc: "Ask questions and get answers from our academic experts.", color: "bg-emerald-600" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all group cursor-default"
              >
                <div className={`w-14 h-14 ${feature.color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:rotate-12`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4">{feature.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* --- HOW IT WORKS (Timeline) --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Your path to <br />
                <span className="text-blue-600">English Fluency</span>
              </h2>
              <div className="mt-12 space-y-12 relative">
                <div className="absolute left-7 top-0 bottom-0 w-1 bg-slate-100 -z-10" />
                {[
                  { title: "Sign Up", desc: "Create your student account using your SLIIT ID." },
                  { title: "Placement Test", desc: "Our AI evaluates your current proficiency level." },
                  { title: "Personalized Plan", desc: "Get a roadmap focused on your specific career goals." },
                  { title: "Master Skills", desc: "Attend sessions and climb the CEFR leaderboard." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="w-14 h-14 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center font-black text-blue-600 shadow-xl group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-slate-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="bg-blue-600 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mb-32 -mr-32 blur-3xl" />
               <Star className="text-amber-400 mb-8 fill-amber-400" size={48} />
               <p className="text-3xl font-bold leading-relaxed italic">
                 "SpeakUni completely changed how I approach my technical presentations. I went from shy to the most confident speaker in my batch."
               </p>
               <div className="mt-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-400 border-2 border-white/50" />
                  <div>
                    <p className="font-black">Sandun Perera</p>
                    <p className="text-sm font-bold text-blue-100">Top Rated Tutor • Year 4</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto bg-slate-50 rounded-[4rem] p-12 md:p-24 text-center border border-slate-200/50">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">Ready to excel?</h2>
          <p className="text-slate-500 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the fastest growing academic English community at SLIIT. Start your journey for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button className="px-12 py-6 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95">
              Claim Your Account
            </button>
            <button className="px-12 py-6 bg-white border-2 border-slate-200 text-slate-700 font-black text-xl rounded-2xl hover:bg-slate-50 transition-all active:scale-95">
              Contact Faculty
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}