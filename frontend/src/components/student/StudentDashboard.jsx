import { motion } from "framer-motion";
import { Flame, CircleCheck, Star, Trophy } from "lucide-react";

import Navbar from "./Navbar";
import StatCard from "./StatCard";
import ContinueLearningCard from "./ContinueLearningCard";
import DailyChallengeCard from "./DailyChallengeCard";
import RecentActivityCard from "./RecentActivityCard";
import PerformanceCard from "./PerformanceCard";
import RecommendationCard from "./RecommendationCard";

const statsData = [
  {
    icon: Flame,
    value: "7",
    label: "Day Streak",
    subtext: "Keep it going!",
    bgColor: "bg-orange-100",
  },
  {
    icon: CircleCheck,
    value: "42",
    label: "Quizzes Completed",
    subtext: "This month",
    bgColor: "bg-green-100",
  },
  {
    icon: Star,
    value: "87%",
    label: "Average Score",
    subtext: "↗ +5% from last month",
    bgColor: "bg-yellow-100",
  },
  {
    icon: Trophy,
    value: "12,450",
    label: "Total Points",
    subtext: "Level 12",
    bgColor: "bg-blue-100",
  },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Quiz Dashboard</h1>
          <p className="text-gray-500 mt-2">Keep up the great work on your learning journey</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              subtext={stat.subtext}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ContinueLearningCard />
          </div>
          <div className="lg:col-span-1">
            <DailyChallengeCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivityCard />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <PerformanceCard />
            <RecommendationCard />
          </div>
        </div>
      </main>
    </div>
  );
}
