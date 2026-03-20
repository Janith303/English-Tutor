// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-indigo-950 to-purple-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm">
            📚
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to speak like a pro?
        </h2>

        <p className="text-xl text-indigo-200 mb-10 max-w-lg mx-auto">
          Join thousands of university students already improving their English every day.
        </p>

        <Link
          to="/signup"
          className="inline-block px-12 py-5 bg-white text-indigo-950 text-2xl font-bold rounded-3xl hover:bg-indigo-100 transition transform hover:-translate-y-1 shadow-xl"
        >
          Create Free Account →
        </Link>

        <p className="mt-12 text-sm text-indigo-300">
          © {new Date().getFullYear()} SpeakUni • Built for Sri Lankan & global university students
        </p>
      </div>
    </footer>
  );
}