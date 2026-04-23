import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Send, 
  X,
  AlertCircle 
} from 'lucide-react';

const TutorQandA = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchNotifications();
    fetchUserProfile();
    
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
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

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get("http://127.0.0.1:8000/api/notifications/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get("http://127.0.0.1:8000/api/user/profile/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (err) {
      console.error("User fetch failed");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`http://127.0.0.1:8000/api/notifications/${id}/mark_as_read/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnswer = async (id) => {
    if (answerText.trim().length < 10) {
      setError("Answer must be at least 10 characters.");
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        "http://127.0.0.1:8000/api/wall-answers/",
        { question: id, body: answerText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(questions.map(q => q.id === id ? { ...q, answers: [...q.answers, response.data] } : q));
      setReplyId(null);
      setAnswerText("");
      setError("");
    } catch (err) {
      setError("Failed to post answer.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-slate-900">
      
      <main className="max-w-5xl mx-auto py-10 px-6">
        {/* --- RE-STYLED HEADER WITH BELL AND PROFILE --- */}
        <header className="mb-12 flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
          <div>
            <h2 className="text-slate-800 text-3xl font-black tracking-tight">Manage Questions</h2>
            <p className="text-slate-500 font-medium">Expert routing active for your areas</p>
          </div>

          <div className="flex items-center gap-6">
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border"
              >
                <Bell className="text-slate-400" size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs text-slate-400 uppercase tracking-widest">Expertise Matches</div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => { handleMarkAsRead(n.id); setShowNotifDropdown(false); }}
                          className={`p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''}`}
                        >
                          <AlertCircle size={18} className="text-blue-500 shrink-0" />
                          <p className="text-xs text-slate-700 leading-snug font-medium">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 italic text-sm">No new routing alerts</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE INFO */}
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 leading-none">{currentUser?.full_name || "Tutor"}</p>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Verified Lecturer</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-blue-50 shadow-md">
                {currentUser?.full_name?.charAt(0) || "T"}
              </div>
            </div>
          </div>
        </header>

        {/* --- QUESTION FEED --- */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Fetching Wall Questions...</p>
            </div>
          ) : (
            questions.map((q) => {
              const isAnswered = q.answers?.some(ans => ans.is_expert_answer);

              return (
                <div key={q.id} className="bg-white border-2 border-slate-100 rounded-3xl p-8 flex gap-8 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col items-center gap-1 text-slate-300 bg-slate-50 rounded-2xl px-4 py-3 h-fit border border-slate-100">
                    <ChevronUp size={24} className="hover:text-blue-600 cursor-pointer" />
                    <span className="font-black text-2xl text-slate-800">{q.votes}</span>
                    <ChevronDown size={24} className="hover:text-red-400 cursor-pointer" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl font-bold text-slate-800 leading-tight">{q.title}</h3>
                      <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                        isAnswered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isAnswered ? 'Answered' : 'Pending'}
                      </span>
                    </div>

                    <p className="text-slate-600 mb-6 leading-relaxed text-lg">{q.body}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {q.tags && q.tags.map(tag => (
                        <span key={tag} className="text-blue-600 text-[11px] font-black px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 uppercase tracking-tight">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                       <div className="flex items-center gap-3 text-slate-400 text-sm">
                         <span className="text-slate-700 font-bold italic">Asked by {q.author_name}</span>
                         <span>•</span>
                         <span className="flex items-center gap-1.5"><Clock size={16}/> {q.created_at_human}</span>
                       </div>

                       {!isAnswered ? (
                         <button 
                            onClick={() => setReplyId(q.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100"
                         >
                            <MessageSquare size={18} /> Answer Question
                         </button>
                       ) : (
                         <div className="flex items-center gap-2 text-green-600 font-black uppercase text-sm">
                            <CheckCircle size={20} /> Expert Verified
                         </div>
                       )}
                    </div>

                    {replyId === q.id && (
                      <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Write Professional Answer</label>
                          <X size={20} className="text-slate-400 cursor-pointer" onClick={() => setReplyId(null)} />
                        </div>
                        <textarea 
                          className={`w-full p-5 border-2 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-lg shadow-inner ${error ? 'border-red-500' : 'border-white'}`}
                          placeholder="Break down the concept clearly..."
                          rows="4"
                          value={answerText}
                          onChange={(e) => {
                            setAnswerText(e.target.value);
                            if(error) setError("");
                          }}
                        ></textarea>
                        {error && <p className="text-red-500 text-sm mt-2 font-bold italic">{error}</p>}
                        <div className="flex justify-end mt-4">
                          <button 
                            onClick={() => handlePostAnswer(q.id)}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100"
                          >
                            <Send size={18} /> Post Expert Answer
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