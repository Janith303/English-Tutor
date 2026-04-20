import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const STORAGE_KEY = "learning_tasks";

const loadTasks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export default function SuggestedLearningCard() {
  const [tasks, setTasks] = useState(() => loadTasks());

  useEffect(() => {
    const handleStorage = () => {
      setTasks(loadTasks());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTask = (id) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#0F172A]">Suggested Learning</h2>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">Complete a quiz to see suggested learning materials.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
                <span
                  className={`text-sm font-medium ${
                    task.completed
                      ? "line-through text-gray-400"
                      : "text-[#0F172A]"
                  }`}
                >
                  {task.completed ? "✔ " : "☐ "}
                  {task.title}
                </span>
              </div>

              {task.link && (
                <a
                  href={task.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}