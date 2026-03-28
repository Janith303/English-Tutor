import { useState } from "react";
import { NavLink } from "react-router-dom";
import logoImg from "../images/logo.jpg";
import avatarImg from "../images/avatar.png";

export default function LearnerTopNav({ student }) {
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/my-learning", label: "My Learning" },
    { path: "/quiz", label: "Quiz" },
    { path: "/qa", label: "Q&A Wall" },
  ];

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <img src={logoImg} alt="logo" className="h-17" />

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

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center">
            <img
              src={avatarImg}
              alt="Student Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
