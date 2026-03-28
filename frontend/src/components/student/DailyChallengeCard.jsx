import { motion } from "framer-motion";
import { Calendar, Play } from "lucide-react";

export default function DailyChallengeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-br from-[#2563EB] via-[#3B82F6] to-[#60A5FA] rounded-2xl p-6 text-white h-full flex flex-col"
    >
      <div className="flex items-center gap-2 text-white/80 mb-4">
        <Calendar className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">Daily Challenge</span>
      </div>

      <h3 className="text-2xl font-bold mb-2">Today's Quiz</h3>
      <p className="text-white/80 text-sm mb-6">
        Complete today's challenge to maintain your streak!
      </p>

      <div className="mt-auto">
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/80 mb-2">
            <span>Progress</span>
            <span>0/10</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-white rounded-full transition-all duration-300" />
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#2563EB] font-semibold rounded-xl hover:bg-blue-50 transition-colors">
          <Play className="w-4 h-4" />
          Start Challenge
        </button>
      </div>
    </motion.div>
  );
}
