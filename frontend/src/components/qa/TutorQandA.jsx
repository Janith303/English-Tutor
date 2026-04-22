import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Bell, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Send, 
  X,
  AlertCircle // Added for routing alerts
} from 'lucide-react';
import logo from "../images/logo.jpg";

const TutorQandA = () => {
  // --- YOUR ORIGINAL STATE ---
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState("");

  // --- NEW: NOTIFICATION & PROFILE STATE ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Added to prevent the crash

  // --- FETCH LIVE DATA ---
  useEffect(() => {
    fetchQuestions();
    fetchNotifications();
    fetchUserProfile();
    
    // Optional: Auto-refresh notifications every 2 mins
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

  // --- NEW: FETCH ROUTING ALERTS ---
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

  // --- YOUR ORIGINAL POST ANSWER LOGIC ---
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
      
      {/* --- NEW NAVBAR SECTION --- */}
      <nav className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src={logo} alt="logo" className="h-10" />
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Expert</span>
        </div>

        <div className="flex items-center gap-6">
          {/* THE NOTIFICATION BELL */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Bell className="text-slate-500" size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-orange-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b font-bold text-[10px] text-slate-400 uppercase tracking-widest">Expertise Routes</div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => { handleMarkAsRead(n.id); setShowNotifDropdown(false); }}
                        className={`p-4 border-b hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : ''}`}
                      >
                        <AlertCircle size={16} className="text-blue-500 shrink-0" />
                        <p className="text-xs text-slate-700 leading-snug">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 italic text-sm">No matched questions yet</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 border"></div>
            <span className="text-sm font-medium">{currentUser?.full_name || "Tutor"}</span>
          </div>
        </div>
      </nav>

      {/* --- YOUR ORIGINAL MAIN CONTENT --- */}
      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-8">
          <h2 className="text-slate-700 text-3xl font-bold mb-2">Manage Questions</h2>
          <p className="text-slate-500">Provide expert answers to student inquiries</p>
        </header>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-slate-500 py-10">Loading active questions...</p>
          ) : (
            questions.map((q) => {
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