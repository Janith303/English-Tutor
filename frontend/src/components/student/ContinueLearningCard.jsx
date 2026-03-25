import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Play } from "lucide-react";

const learningItems = [
  {
    id: 1,
    icon: BookOpen,
    title: "Intermediate Vocabulary",
    subtitle: "Question 8 of 15",
    progress: 55,
  },
  {
    id: 2,
    icon: GraduationCap,
    title: "Grammar Fundamentals",
    subtitle: "Question 3 of 10",
    progress: 30,
  },
];

export default function ContinueLearningCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Continue Learning</h2>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All →
        </a>
      </div>

      <div className="space-y-4">
        {learningItems.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <item.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Play className="w-3 h-3" />
              Resume
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
