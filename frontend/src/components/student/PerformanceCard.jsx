import { motion } from "framer-motion";

const categories = [
  { name: "Vocabulary", progress: 92 },
  { name: "Grammar", progress: 85 },
  { name: "Reading", progress: 88 },
  { name: "Idioms", progress: 78 },
];

export default function PerformanceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
    >
      <h2 className="text-lg font-semibold text-[#0F172A] mb-6">Performance by Category</h2>

      <div className="space-y-5">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#475569]">{category.name}</span>
              <span className="text-sm font-semibold text-[#0F172A]">{category.progress}%</span>
            </div>
            <div className="h-2 bg-[#DBEAFE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ width: `${category.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
