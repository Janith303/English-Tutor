// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import logo from "../components/images/logo.jpg";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-1 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="logo" className="h-15" />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link
            to="/"
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            About Us
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="px-4 py-1.5 text-purple-600 text-sm font-bold hover:bg-purple-100 rounded-lg transition-all"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-all active:scale-95 shadow-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
