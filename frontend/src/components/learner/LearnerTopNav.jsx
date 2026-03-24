import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function LearnerTopNav({ student }) {
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/hub", label: "My Learning" },
    { path: "/quiz", label: "Quiz" },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <img src="/logo.jpg" alt="logo" className="h-17" />

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium pb-1 transition-colors ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            {student?.avatar ? (
              <img src={student.avatar} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold">
                {student?.name?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}