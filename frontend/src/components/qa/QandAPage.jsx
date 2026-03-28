import React, { useState } from 'react';
import { Search, Bell, Plus, ChevronUp, ChevronDown, MessageSquare, Clock } from 'lucide-react';
import AskQuestionModal from './AskQuestionModal';
import logo from '../images/logo.jpg';

const DUMMY_QUESTIONS = [
  {
    id: 1,
    title: 'What\'s the difference between "affect" and "effect"?',
    body: 'I always get confused between these two words. Can someone explain when to use "affect" versus "effect" with some clear examples?',
    votes: 42,
    tags: ['grammar', 'vocabulary', 'common-mistakes'],
    author: 'Anonymous Learner #001',
    answers: 8,
    time: '2 hours ago'
  },
  {
    id: 2,
    title: 'How can I improve my English pronunciation?',
    body: 'I have a strong command of English grammar and vocabulary, but my pronunciation is still poor. Any tips or resources you can recommend?',
    votes: 28,
    tags: ['writing', 'speaking'],
    author: 'Anonymous Learner #002',
    answers: 8,
    time: '3 hours ago'
  },
  {
    id: 3,
    title: 'What is the correct usage of "its" and "it\'s"?',
    body: 'I often confuse the possessive form "its" with the contraction "it\'s". Could someone provide clear examples of when to use each?',
    votes: 35,
    tags: ['grammar', 'vocabulary'],
    author: 'Anonymous Learner #003',
    answers: 8,
    time: '3 hours ago'
  },
  {
    id: 4,
    title: 'How should I answer the question "Tell me about yourself" in a job interview?',
    body: 'I\'m preparing for a job interview and I\'m not sure how to effectively answer the classic question "Tell me about yourself." Any advice or tips?',
    votes: 40,
    tags: ['Interview', 'Speaking'],
    author: 'Anonymous Learner #004',
    answers: 5,
    time: '4 hours ago'
  }
];

const QandAPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All Questions');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <img src={logo} alt="EnglishTutor Logo" className="h-15 w-auto object-contain" />
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
            <img 
                src="https://ui-avatars.com/api/?name=Sanooda+Abeysinghe&background=random" 
                alt="User" 
                className="w-8 h-8 rounded-full" 
            />
            <span className="font-medium text-sm text-slate-700">Sanooda Abeysinghe</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-8">
          <h2 className="text-slate-700 text-3xl font-bold mb-2">Q & A Wall</h2>
          <p className="text-slate-500">Ask questions, share knowledge, and learn English together</p>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-lg border w-fit shadow-sm">
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
            <div key={q.id} className="bg-white border rounded-xl p-6 flex gap-6 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex flex-col items-center gap-1 text-slate-400 bg-slate-50 rounded-lg px-3 py-2 h-fit group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <ChevronUp className="cursor-pointer" />
                <span className="font-bold text-lg text-slate-800">{q.votes}</span>
                <ChevronDown className="cursor-pointer" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-slate-600 group-hover:text-blue-600 transition-colors">{q.title}</h3>
                <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">{q.body}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {q.tags.map(tag => (
                    <span key={tag} className="text-blue-600 text-xs font-semibold px-2 py-1 rounded bg-blue-50 border border-blue-100 capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-slate-500 text-sm">
                   <div className="flex items-center gap-2">
                     <img src={`https://ui-avatars.com/api/?name=${q.author}&background=random`} alt={q.author} className="w-6 h-6 rounded-full" />
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

      {/* Modal */}
      {isModalOpen && <AskQuestionModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default QandAPage;