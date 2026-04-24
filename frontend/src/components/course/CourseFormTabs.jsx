export default function CourseFormTabs({ activeTab, onTabChange }) {
  const tabs = [
    { key: "basic", label: "Basic Info" },
    { key: "structure", label: "Course Structure" },
  ];

  return (
    <div className="flex items-end gap-8 border-b border-gray-200 mb-7">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`pb-3 text-lg font-bold relative transition-colors ${
            activeTab === tab.key
              ? "text-blue-600"
              : "text-black hover:text-black"
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
