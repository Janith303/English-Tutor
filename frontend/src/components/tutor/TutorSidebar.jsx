import logo from "../images/logo.jpg";

export default function TutorSidebar({
  activePage,
  onNavigate,
  tutor,
  onLogout,
}) {
  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      key: "courses",
      label: "Courses",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      <div className="px-5 pt-6 pb-5 border-b border-gray-50 flex items-center justify-center">
        <img src={logo} alt="English Tutor Logo" className="h-20 w-auto" />
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate && onNavigate(item.key)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors ${
              activePage === item.key
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <button
          onClick={() => onNavigate && onNavigate("create")}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl w-full justify-center transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Quick Create
        </button>
      </nav>

      <div className="px-4 pb-6 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {tutor?.avatar ? (
              <img
                src={tutor.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">
                {tutor?.name?.charAt(0) || "T"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {tutor?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{tutor?.role}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm transition-colors w-full"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
