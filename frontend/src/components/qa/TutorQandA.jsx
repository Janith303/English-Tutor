import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, ChevronUp, ChevronDown, MessageSquare, Clock, CheckCircle, Send, X } from 'lucide-react';

const TutorQandA = () => {
  // --- STATE MANAGEMENT ---
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState("");

  // --- FETCH LIVE DATA ---
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get("http://127.0.0.1:8000/api/wall-questions/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- POST EXPERT ANSWER ---
  const handlePostAnswer = async (id) => {
    if (answerText.trim().length < 10) {
      setError("Answer must be at least 10 characters.");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        "http://127.0.0.1:8000/api/wall-answers/",
        {
          question: id,
          body: answerText
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Instantly update the UI to show the question is now "Answered"
      setQuestions(questions.map(q => 
        q.id === id ? { ...q, answers: [...q.answers, response.data] } : q
      ));

      setReplyId(null);
      setAnswerText("");
      setError("");
    } catch (err) {
      console.error("Error posting answer:", err);
      setError("Failed to post answer. Check your connection.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-slate-900">
      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-8">
          <h2 className="text-slate-700 text-3xl font-bold mb-2">Manage Questions</h2>
          <p className="text-slate-500">Provide expert answers to student inquiries</p>
        </header>

        {/* Feed */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-slate-500 py-10">Loading active questions...</p>
          ) : (
            questions.map((q) => {
              // A question is "answered" if any reply has is_expert_answer = true
              const isAnswered = q.answers?.some(ans => ans.is_expert_answer);

              return (
                <div key={q.id} className="bg-white border rounded-xl p-6 flex gap-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col items-center gap-1 text-slate-400 bg-slate-50 rounded-lg px-3 py-2 h-fit">
                    <ChevronUp size={20} />
                    <span className="font-bold text-lg text-slate-800">{q.votes}</span>
                    <ChevronDown size={20} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-600">{q.title}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                        isAnswered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isAnswered ? 'Answered' : 'Pending'}
                      </span>
                    </div>

                    <p className="text-slate-600 mb-4 leading-relaxed">{q.body}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {q.tags && q.tags.map(tag => (
                        <span key={tag} className="text-blue-600 text-xs font-semibold px-2 py-1 rounded bg-blue-50 border border-blue-100 capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t pt-4 mt-2">
                       <div className="flex items-center gap-2 text-slate-500 text-sm">
                         <span className="font-medium italic">Asked by {q.author_name}</span>
                         <span>•</span>
                         <span className="flex items-center gap-1"><Clock size={14}/> {q.created_at_human}</span>
                       </div>

                       {!isAnswered ? (
                         <button 
                            onClick={() => setReplyId(q.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                         >
                           <MessageSquare size={16} /> Answer Question
                         </button>
                       ) : (
                         <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                           <CheckCircle size={16} /> Expert Answer Provided
                         </div>
                       )}
                    </div>

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
                          onChange={(e) => {
                            setAnswerText(e.target.value);
                            if(error) setError("");
                          }}
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
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default TutorQandA;