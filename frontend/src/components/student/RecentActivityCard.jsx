import { motion } from "framer-motion";
import { CheckCircle, Award, Flame, BookCheck } from "lucide-react";

const activities = [
  {
    id: 1,
    icon: CheckCircle,
    title: "Completed Advanced Idioms Quiz",
    subtext: "Score: 92% • 2 hours ago",
    points: "+250 pts",
    color: "bg-green-100 text-green-600",
  },
  {
    id: 2,
    icon: Award,
    title: 'Earned "Vocabulary Master" Badge',
    subtext: "Yesterday",
    points: null,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: 3,
    icon: Flame,
    title: "Reached 7-day streak",
    subtext: "Today",
    points: "+100 pts",
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 4,
    icon: BookCheck,
    title: "Completed Grammar Essentials Quiz",
    subtext: "Score: 85% • 2 days ago",
    points: "+200 pts",
    color: "bg-blue-100 text-blue-600",
  },
];

export default function RecentActivityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
          >
            <div className={`${activity.color} p-2.5 rounded-full`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{activity.title}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.subtext}</p>
            </div>
            {activity.points && (
              <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                {activity.points}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
