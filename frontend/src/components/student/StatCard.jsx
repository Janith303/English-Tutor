import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, value, label, subtext, bgColor = "bg-blue-100" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className={`${bgColor} p-3 rounded-xl`}>
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
          <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        </div>
      </div>
    </motion.div>
  );
}
