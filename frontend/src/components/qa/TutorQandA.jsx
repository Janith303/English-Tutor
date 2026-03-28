import React, { useState } from 'react';
import { Search, Bell, ChevronUp, ChevronDown, MessageSquare, Clock, CheckCircle, Send, X } from 'lucide-react';

const DUMMY_QUESTIONS = [
  {
    id: 1,
    title: 'What\'s the difference between "affect" and "effect"?',
    body: 'I always get confused between these two words. Can someone explain when to use "affect" versus "effect" with some clear examples?',
    votes: 42,
    tags: ['grammar', 'vocabulary'],
    author: 'Anonymous Learner #001',
    status: 'pending',
    time: '2 hours ago'
  },
  {
    id: 2,
    title: 'How can I improve my English pronunciation?',
    body: 'I have a strong command of English grammar and vocabulary, but my pronunciation is still poor.',
    votes: 28,
    tags: ['speaking'],
    author: 'Anonymous Learner #002',
    status: 'answered',
    answer: 'Focus on phonics and try record-and-compare methods!',
    time: '3 hours ago'
  }
];

const TutorQandA = () => {
  const [replyId, setReplyId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState("");

  const handlePostAnswer = (id) => {
    if (answerText.trim().length < 10) {
      setError("Answer must be at least 10 characters.");
      return;
    }
    alert(`Answer posted for Question #${id}!`);
    setReplyId(null);
    setAnswerText("");
    setError("");
  };

  return (
    <div className="bg-gray-50 font-sans text-slate-900">
      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-8">
          <h2 className="text-slate-700 text-3xl font-bold mb-2">Manage Questions</h2>
          <p className="text-slate-500">Provide expert answers to student inquiries</p>
        </header>

        {/* Feed - Matches Student View Styling */}
        <div className="space-y-4">
          {DUMMY_QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white border rounded-xl p-6 flex gap-6 shadow-sm hover:shadow-md transition-all">
              {/* Vote Box Styling */}
              <div className="flex flex-col items-center gap-1 text-slate-400 bg-slate-50 rounded-lg px-3 py-2 h-fit">
                <ChevronUp size={20} />
                <span className="font-bold text-lg text-slate-800">{q.votes}</span>
                <ChevronDown size={20} />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-600">{q.title}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                    q.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <p className="text-slate-600 mb-4 leading-relaxed">{q.body}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {q.tags.map(tag => (
                    <span key={tag} className="text-blue-600 text-xs font-semibold px-2 py-1 rounded bg-blue-50 border border-blue-100 capitalize">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4 mt-2">
                   <div className="flex items-center gap-2 text-slate-500 text-sm">
                     <span className="font-medium italic">Asked by {q.author}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1"><Clock size={14}/> {q.time}</span>
                   </div>

                   {q.status === 'pending' ? (
                     <button 
                        onClick={() => setReplyId(q.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                     >
                       <MessageSquare size={16} /> Answer Question
                     </button>
                   ) : (
                     <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                       <CheckCircle size={16} /> Question Answered
                     </div>
                   )}
                </div>

                {/* Reply Form */}
                {replyId === q.id && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-blue-700">Your Response</label>
                      <X size={18} className="text-slate-400 cursor-pointer" onClick={() => setReplyId(null)} />
                    </div>
                    <textarea 
                      className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all ${error ? 'border-red-500' : 'border-white'}`}
                      placeholder="Explain the concept clearly..."
                      rows="3"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    ></textarea>
                    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
                    <div className="flex justify-end mt-3">
                      <button 
                        onClick={() => handlePostAnswer(q.id)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-blue-700"
                      >
                        <Send size={14} /> Post to Wall
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TutorQandA;