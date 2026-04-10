import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import logoImg from "../images/logo.jpg";


export default function LearnerTopNav({ student }) {
  const navigate = useNavigate();
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/my-learning", label: "My Learning" },
    { path: "/quiz", label: "Quiz" },
    { path: "/qa", label: "Q&A Wall" },
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <img src={logoImg} alt="logo" className="h-15" />

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium pb-1 transition-colors ${
                  isActive
                    ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
