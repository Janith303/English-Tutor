export default function WeekSchedulePanel({ schedule }) {
  const hasItems = Array.isArray(schedule) && schedule.length > 0;

  return (
    <div>
      <h3 className="font-bold text-gray-900 text-base mb-4">
        This Week's Schedule
      </h3>
      <div className="flex flex-col gap-3">
        {!hasItems && (
          <p className="text-xs text-gray-400">
            No sessions planned yet. Enroll in a course to generate your weekly
            plan.
          </p>
        )}
        {hasItems &&
          schedule.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span
                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  item.isToday ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${item.isToday ? "text-gray-900" : "text-gray-600"}`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
