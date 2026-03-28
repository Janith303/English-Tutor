import { useState } from "react";
 
export default function CourseSearchFilter({ onSearch, onCategory }) {
  const [query, setQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Category");
 
  const categories = ["All", "Writing", "Grammar", "Speaking", "Vocabulary", "Business"];
 
  const handleSelect = (cat) => {
    setSelectedCategory(cat === "All" ? "Category" : cat);
    setCategoryOpen(false);
    if (onCategory) onCategory(cat);
  };
 
  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <button
        onClick={() => onSearch && onSearch(query)}
        className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
 
      {/* Category dropdown */}
      <div className="relative">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 h-10 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          {selectedCategory}
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
 