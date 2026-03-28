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
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#0F172A]">Continue Learning</h2>
        <a href="#" className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium">
          View All →
        </a>
      </div>

      <div className="space-y-4">
        {learningItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#EFF6FF] rounded-xl p-4 flex items-center gap-4"
          >
            <div className="bg-[#DBEAFE] p-3 rounded-xl">
              <item.icon className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A]">{item.title}</p>
              <p className="text-xs text-[#475569] mt-1">{item.subtitle}</p>
              <div className="mt-2 h-1.5 bg-[#DBEAFE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-xs font-medium rounded-xl hover:bg-[#1D4ED8] transition-colors">
              <Play className="w-3 h-3" />
              Resume
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
