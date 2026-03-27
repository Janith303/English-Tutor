export default function LearningStatsPanel({ stats }) {
  const items = [
    { label: "Courses Completed", value: stats.coursesCompleted, color: "text-blue-600" },
    { label: "Hours Studied", value: stats.hoursStudied, color: "text-green-500" },
    { label: "Streak Days", value: stats.streakDays, color: "text-orange-500" },
  ];
 
  return (
    <div className="bg-blue-50 rounded-2xl p-5">
      <h3 className="font-bold text-gray-900 text-base mb-4">Learning Progress</h3>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{item.label}</span>
            <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}