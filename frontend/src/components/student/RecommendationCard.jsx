import { motion } from "framer-motion";
import { Target } from "lucide-react";

export default function RecommendationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Recommended for You</h2>
      </div>

      <div className="bg-blue-50 rounded-xl p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-2">Improve Your Idioms</h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on your performance, we recommend practicing idioms
        </p>
        <button className="w-full px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          Start Quiz
        </button>
      </div>
    </motion.div>
  );
}
