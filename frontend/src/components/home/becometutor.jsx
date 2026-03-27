import React from "react";
import { 
  ShieldCheck, 
  ClipboardList, 
  UserCheck, 
  Presentation, 
  GraduationCap, 
  HeartHandshake, 
  MessageSquare, 
  Trophy,
  ArrowRight,
  Quote
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../Topnav";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    title: "Check Eligibility",
    desc: "Ensure you are a 2nd year or above student with a GPA of 3.0+ in English modules.",
    icon: <ShieldCheck size={32} />,
  },
  {
    title: "Submit Application",
    desc: "Fill out the 3-step form with your skills, availability, Short Teaching Video, and university ID.",
    icon: <ClipboardList size={32} />,
  },
  {
    title: "Verification Process",
    desc: "The English Department reviews your profile and verifies your credentials.",
    icon: <UserCheck size={32} />,
  },
  {
    title: "Start Teaching",
    desc: "Access your tutor dashboard, set your hourly rates, and start helping peers.",
    icon: <Presentation size={32} />,
  },
];

const benefits = [
  { title: "Earn Experience", icon: <GraduationCap />, desc: "Boost your CV with recognized teaching hours." },
  { title: "Help Peers", icon: <HeartHandshake />, desc: "Make a real impact on the SLIIT student community." },
  { title: "Improve Communication", icon: <MessageSquare />, desc: "Sharpen your public speaking and English fluency." },
  { title: "Build Academic Profile", icon: <Trophy />, desc: "Get certificates endorsed by the English Dept." },
];

export default function HowToBecomeTutor() {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* NEW MESH BACKGROUND: Deeper Blues for better contrast */}
        <div className="absolute inset-0 z-0 bg-slate-50">
          <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-700/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[100px]" />
          <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white rounded-full shadow-lg">
              Join the Academic Elite
            </span>
            {/* FIXED: Darker heading color for visibility */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-slate-900">
              How to Become <br />
              <span className="text-blue-700">a Tutor</span>
            </h1>
            <p className="text-lg text-slate-600 font-semibold mb-10 max-w-lg leading-relaxed">
              Empower your peers while mastering your own skills. Our structured onboarding process ensures you're ready to lead the next generation.
            </p>
            <button className="px-10 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
            onClick={() => navigate("/signup")}>
              Apply Now <ArrowRight size={20} />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative z-10 bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-100">
              <img 
                src="https://illustrations.popsy.co/blue/studying.svg" 
                alt="Tutoring" 
                className="w-full h-auto rounded-[2rem]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- ONBOARDING JOURNEY --- */}
      <section className="py-24 px-6 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight mb-4">Onboarding Journey</h2>
            <p className="text-blue-300 font-bold tracking-wide uppercase text-xs">Your 4-step path to certification</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-slate-800/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-700 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-black mb-3 text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                <div className="mt-6 text-blue-500 font-black text-2xl opacity-20 group-hover:opacity-100 transition-opacity">0{idx + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* FIXED: Darkened Title and Description */}
            <h2 className="text-4xl font-black tracking-tight mb-8 text-slate-900">Why Join the <br/><span className="text-blue-600">Tutor Corps?</span></h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-300 transition-all group">
                  <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                  <h4 className="font-black text-slate-900 text-lg mb-2">{benefit.title}</h4>
                  {/* FIXED: Darker font for better readability */}
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-[3rem] p-12 text-white relative shadow-2xl">
             <Quote className="absolute top-10 right-10 opacity-20 text-white" size={100} />
             <div className="relative z-10">
                <p className="text-2xl font-bold leading-relaxed italic mb-8">
                  "Being a tutor at SLIIT helped me overcome my fear of public speaking. Seeing my juniors succeed is the best reward."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-400 border-2 border-white/50" />
                  <div>
                    <p className="font-black text-lg">Chamithra Perera</p>
                    <p className="text-sm text-blue-100 font-bold uppercase tracking-widest">3rd Year IT Student</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Ready to make <br/>a difference?</h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto relative z-10 font-bold">
            Join 50+ tutors making an impact at SLIIT. Your application takes less than 5 minutes.
          </p>
          <button className="relative z-10 px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl"
          onClick={() => navigate("/signup")}>
            Apply Now
          </button>
        </div>
      </section>

      {/* <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
        English Tutor • SLIIT Student Developers
      </footer> */}
      <Footer />
    </div>
  );
}