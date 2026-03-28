// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import logo from "../components/images/logo.jpg";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md shadow-sm border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 py-1 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="logo" className="h-15" />
          </Link>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link
            to="/"
            className="text-[#475569] hover:text-[#2563EB] transition-colors"
          >
            Home
          </Link>
          <Link
            to="/becometutor"
            className="text-[#475569] hover:text-[#2563EB] transition-colors"
          >
           become a tutor
          </Link>
        </div>

        {/* Authentication Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="px-4 py-1.5 text-[#2563EB] text-sm font-bold hover:bg-[#EFF6FF] rounded-lg transition-all"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-[#1D4ED8] transition-all active:scale-95 shadow-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}