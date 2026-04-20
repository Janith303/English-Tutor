import { useState } from "react";

export default function CourseSearchFilter({
  onCategory,
  categories = ["All"],
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Category");

  const handleSelect = (cat) => {
    setSelectedCategory(cat === "All" ? "Category" : cat);
    setCategoryOpen(false);
    if (onCategory) onCategory(cat);
  };

  return (
    <div className="flex items-center">
      {/* Category dropdown */}
      <div className="relative">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 h-10 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          {selectedCategory}
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {categoryOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleSelect(cat)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
