import { BookOpen, FileText, Eye, MessageSquare } from "lucide-react";

const categories = [
  {
    icon: BookOpen,
    title: "Vocabulary",
    description: "Expand your word bank with synonyms, antonyms, and context-based learning.",
  },
  {
    icon: FileText,
    title: "Grammar",
    description: "Master sentence structure, tenses, and parts of speech.",
  },
  {
    icon: Eye,
    title: "Reading",
    description: "Improve comprehension with passages and inference exercises.",
  },
  {
    icon: MessageSquare,
    title: "Idioms",
    description: "Learn common English expressions and their meanings.",
  },
];

export default function CategoryCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100">
      <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export { categories };
