// src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-1 group h-15">
          {/* Changed bg-accent to bg-blue-600 for your new palette */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
            📚
          </div>
          <div className="flex flex-col justify-center leading-none">
            <h2 className="text-xl md:text-2xl font-black text-blue-900 leading-none tracking-tight">
              English Tutor
            </h2>
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link
            to="/"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            About Us
          </Link>

          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Courses
          </Link>
        </div>

        {/* Authentication Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="px-4 py-1.5 text-blue-600 text-sm font-bold hover:bg-blue-100 rounded-lg transition-all"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
