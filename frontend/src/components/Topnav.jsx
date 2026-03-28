// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import logo from "../components/images/logo.jpg";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md shadow-sm border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 py-1 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="logo" className="h-15" />
        </Link>
        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {/* Force a hard refresh */}
          <a
            href="/"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Home
          </a>
          <a
            href="/becometutor"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            become a tutor
          </a>
        </div>

        {/* Authentication Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="/signup"
            className="px-4 py-1.5 text-blue-600 text-sm font-bold hover:bg-blue-100 rounded-lg transition-all"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}
