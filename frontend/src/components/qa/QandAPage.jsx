import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronUp, ChevronDown, MessageSquare, Clock } from 'lucide-react';
import AskQuestionModal from './AskQuestionModal';

const DUMMY_QUESTIONS = [
  {
    id: 1,
    title: 'What\'s the difference between "affect" and "effect"?',
    body: 'I always get confused between these two words. Can someone explain when to use "affect" versus "effect" with some clear examples?',
    votes: 42,
    tags: ['grammar', 'vocabulary', 'common-mistakes'],
    author: 'Michael Johnson',
    answers: 8,
    time: '2 hours ago'
  },
  // Add more dummy objects here to fill the wall
];

const QandAPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All Questions');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <span className="text-white font-bold text-xl">EH</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">EnglishHub</h1>
        </div>

        <div className="flex-1 max-w-xl mx-12 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search questions..." 
            className="w-full bg-slate-100 border-none rounded-md py-2 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={18} /> Ask Question
          </button>
          <Bell className="text-slate-500 cursor-pointer" />
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="https://ui-avatars.com/api/?name=Sarah+Chen&background=random" alt="User" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-sm">Sarah Chen</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Questions</h2>
          <p className="text-slate-500">Ask questions, share knowledge, and learn English together</p>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-lg border w-fit">
          {['All Questions', 'My Questions', 'Unanswered', 'Most Upvoted'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {DUMMY_QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white border rounded-xl p-6 flex gap-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col items-center gap-1 text-slate-500 bg-slate-50 rounded-lg px-3 py-2 h-fit">
                <ChevronUp className="hover:text-blue-600 transition-colors" />
                <span className="font-bold text-lg text-slate-800">{q.votes}</span>
                <ChevronDown className="hover:text-red-600 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">{q.title}</h3>
                <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">{q.body}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {q.tags.map(tag => (
                    <span key={tag} className="text-blue-600 text-xs font-semibold px-2 py-1 rounded bg-blue-50">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-slate-500 text-sm">
                   <div className="flex items-center gap-2">
                     <img src={`https://ui-avatars.com/api/?name=${q.author}`} alt={q.author} className="w-6 h-6 rounded-full" />
                     <span className="font-medium text-slate-700">{q.author}</span>
                   </div>
                   <div className="flex gap-4">
                     <span className="flex items-center gap-1"><MessageSquare size={14}/> {q.answers} answers</span>
                     <span className="flex items-center gap-1"><Clock size={14}/> {q.time}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal with Validation */}
      {isModalOpen && <AskQuestionModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default QandAPage;