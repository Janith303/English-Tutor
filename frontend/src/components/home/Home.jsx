import React, { useState, useEffect } from "react";
import Navbar from "../Topnav"; // Double check this path matches your folder
import Footer from "../Footer";

const sliderImages = [
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200", // Study group
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200", // Lecture hall
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200", // Study group
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200", // Lecture hall
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* 1. Image Slider Section (Top) 
          Reduced pt-16 to account for slim navbar and removed mb/mt gaps */}
      <section className="bg-gray-50 pt-16 pb-6">
        <div className="w-full mx-auto">
          <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden shadow-lg border-b border-blue-100">
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
                {currentSlide === 3 && "Graduation Success"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hero Section (Content)
          Changed min-h-screen to py-12 to reduce massive vertical gaps */}
      <section className="relative py-12 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text */}
          <div className="space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 rounded-full text-xs font-bold text-blue-700 uppercase tracking-wider">
              ✨ Designed for University Students
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-blue-900 tracking-tighter">
              Master English.
              <br />
              <span className="text-blue-600">Excel at Uni.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
              Personalized AI tutoring and real-world experts. Improve your speaking, 
              academic writing, and research skills on one platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#signup"
                className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition shadow-lg transform hover:-translate-y-1 active:scale-95"
              >
                Start Free Trial
              </a>
              <a
                href="#demo"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg font-bold rounded-xl hover:bg-blue-50 transition active:scale-95"
              >
                Watch Demo
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="relative block w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200"
              alt="Students collaborating"
              className="rounded-3xl shadow-2xl object-cover w-full h-[450px] border border-blue-100"
            />
            {/* GPA Badge */}
            <div className="absolute -bottom-4 -right-2 md:-right-4 bg-white px-5 py-3 rounded-2xl shadow-xl border border-blue-100">
              <p className="font-black text-green-600 text-xl md:text-2xl">
                GPA 3.8 → 4.0
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-blue-900 leading-tight tracking-tight">
                Academic English Coach
              </h2>
              <ul className="space-y-4">
                {[
                  "Academic essays & research papers",
                  "Live 1-on-1 university sessions",
                  "Real-time CEFR level tracking",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-4 items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors"
                  >
                    <span className="text-xl">✅</span>
                    <span className="font-bold text-blue-900">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonial Card */}
            <div className="bg-blue-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-800 rounded-full -mr-16 -mt-16 opacity-40"></div>
              <p className="italic text-2xl relative z-10 leading-relaxed">
                "My research proposal was accepted after working with my
                SpeakUni tutor! My grades improved significantly."
              </p>
              <div className="mt-8 relative z-10">
                <p className="font-black text-blue-300">Student Success Story</p>
                <p className="text-sm opacity-80 text-blue-100">IT Major • Year 3</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}