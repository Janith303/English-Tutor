import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.jpg";

export default function TutorTopNav({
  activePage,
  onNavigate,
  tutor,
  onLogout,
}) {
  const navigate = useNavigate();
  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "courses", label: "Courses" },
    { key: "qa", label: "Q&A wall" },

  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <img src={logo} alt="English Tutor Logo" className="h-12 w-auto" />

        <div className="flex-1 hidden md:flex items-center justify-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate && onNavigate(item.key)}
              className={`text-sm font-medium pb-1 transition-colors whitespace-nowrap ${
                activePage === item.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => navigate("/tutor/create-quiz")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Add Quiz
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {tutor?.avatar ? (
              <img
                src={tutor.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-bold">
                {tutor?.name?.charAt(0) || "T"}
              </span>
            )}
          </div>

          <button
            onClick={onLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
