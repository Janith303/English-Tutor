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
  AlertCircle,
  BookOpen, // New for articles
  Upload, // New for upload
  FileImage, // New for PNGs
  Trash2 // New for deleting articles
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

  // --- NEW: ARTICLE STATES ---
  const [view, setView] = useState("qa"); // 'qa' or 'articles'
  const [articles, setArticles] = useState([]);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleFile, setArticleFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchNotifications();
    fetchUserProfile();
    fetchArticles(); // Fetch articles on load
    
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

  // --- NEW: FETCH ARTICLES ---
  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get("http://127.0.0.1:8000/api/articles/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(response.data);
    } catch (err) {
      console.error("Error fetching articles:", err);
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

  // --- NEW: UPLOAD ARTICLE LOGIC ---
  const handleUploadArticle = async (e) => {
    e.preventDefault();
    if (!articleTitle || !articleFile) {
        alert("Please provide both a title and a PNG image.");
        return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("title", articleTitle);
    formData.append("image", articleFile);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post("http://127.0.0.1:8000/api/articles/", formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
        }
      });
      setArticles([response.data, ...articles]);
      setIsArticleModalOpen(false);
      setArticleTitle("");
      setArticleFile(null);
    } catch (err) {
      alert("Failed to upload article.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
      if(!window.confirm("Delete this article?")) return;
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://127.0.0.1:8000/api/articles/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setArticles(articles.filter(a => a.id !== id));
      } catch (err) {
          alert("Could not delete article.");
      }
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-slate-900">
      <main className="max-w-5xl mx-auto py-10 px-6">
        
        {/* --- HEADER --- */}
        <header className="mb-12 flex justify-between items-center bg-white p-6 rounded-2xl border border-black/[0.05] shadow-sm">
          <div>
            <h2 className="text-slate-800 text-3xl font-black tracking-tight">Tutor Dashboard</h2>
            <p className="text-slate-500 font-medium">Manage student engagement and learning resources</p>
          </div>

          <div className="flex items-center gap-6">
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
                  <div className="p-4 bg-slate-50 border-b font-bold text-xs text-slate-400 uppercase tracking-widest">Routing Alerts</div>
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
                      <div className="p-8 text-center text-slate-400 italic text-sm">No alerts</div>
                    )}
                  </div>
                </div>
              )}
            </div>

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

        {/* --- VIEW TOGGLE & ACTION BUTTON --- */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex bg-white border border-black/[0.08] p-1 rounded-xl shadow-sm">
                <button 
                    onClick={() => setView("qa")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'qa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <MessageSquare size={16} /> Q&A Wall
                </button>
                <button 
                    onClick={() => setView("articles")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'articles' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <BookOpen size={16} /> My Articles
                </button>
            </div>

            {view === "articles" && (
                <button 
                    onClick={() => setIsArticleModalOpen(true)}
                    className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95"
                >
                    <Upload size={18} /> Upload Article
                </button>
            )}
        </div>

        {view === "qa" ? (
            /* --- ORIGINAL QUESTION FEED --- */
            <div className="space-y-6">
            {loading ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Loading Q&A...</p>
                </div>
            ) : (
                questions.map((q) => {
                const isAnswered = q.answers?.some(ans => ans.is_expert_answer);
                return (
                    <div key={q.id} className="bg-white border border-black/[0.08] rounded-3xl p-8 flex gap-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col items-center gap-1 text-slate-300 bg-slate-50 rounded-2xl px-4 py-3 h-fit border border-black/[0.03]">
                        <ChevronUp size={24} className="hover:text-blue-600 cursor-pointer" />
                        <span className="font-black text-2xl text-slate-800">{q.votes}</span>
                        <ChevronDown size={24} className="hover:text-red-400 cursor-pointer" />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                        <h3 className="text-2xl font-bold text-slate-800 leading-tight">{q.title}</h3>
                        <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${isAnswered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isAnswered ? 'Answered' : 'Pending'}
                        </span>
                        </div>
                        <p className="text-slate-600 mb-6 leading-relaxed text-lg">{q.body}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                        {q.tags && q.tags.map(tag => (
                            <span key={tag} className="text-blue-600 text-[11px] font-black px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 uppercase tracking-tight">#{tag}</span>
                        ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-black/[0.04] pt-6">
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <span className="text-slate-700 font-bold italic">Asked by {q.author_name}</span>
                            <span className="flex items-center gap-1.5"><Clock size={16}/> {q.created_at_human}</span>
                        </div>
                        {!isAnswered ? (
                            <button onClick={() => setReplyId(q.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-100">
                                <MessageSquare size={18} /> Answer Question
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-green-600 font-black uppercase text-sm"><CheckCircle size={20} /> Expert Verified</div>
                        )}
                        </div>
                        {replyId === q.id && (
                        <div className="mt-6 p-6 bg-slate-50 rounded-3xl border border-black/[0.04] animate-in slide-in-from-top-4 duration-300">
                            <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Write Professional Answer</label>
                            <X size={20} className="text-slate-400 cursor-pointer" onClick={() => setReplyId(null)} />
                            </div>
                            <textarea className={`w-full p-5 border-2 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all text-lg shadow-inner ${error ? 'border-red-500' : 'border-white'}`} placeholder="Break down the concept clearly..." rows="4" value={answerText} onChange={(e) => { setAnswerText(e.target.value); if(error) setError(""); }}></textarea>
                            {error && <p className="text-red-500 text-sm mt-2 font-bold italic">{error}</p>}
                            <div className="flex justify-end mt-4">
                            <button onClick={() => handlePostAnswer(q.id)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100"><Send size={18} /> Post Expert Answer</button>
                            </div>
                        </div>
                        )}
                    </div>
                    </div>
                );
                })
            )}
            </div>
        ) : (
            /* --- NEW ARTICLES GALLERY SECTION --- */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((art) => (
                    <div key={art.id} className="bg-white border border-black/[0.08] rounded-3xl overflow-hidden shadow-sm group">
                        <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                            <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 right-4">
                                <button 
                                    onClick={() => handleDeleteArticle(art.id)}
                                    className="p-2 bg-white/90 text-red-500 rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-slate-800 text-lg mb-1">{art.title}</h4>
                            <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                                <Clock size={12} /> {art.created_at_human}
                            </p>
                        </div>
                    </div>
                ))}
                {articles.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-black/[0.08] rounded-3xl">
                        <FileImage size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-sm tracking-widest">No Articles Uploaded Yet</p>
                    </div>
                )}
            </div>
        )}
      </main>

      {/* --- NEW: ARTICLE UPLOAD MODAL --- */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsArticleModalOpen(false)}></div>
            <form 
                onSubmit={handleUploadArticle}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-black/[0.08]"
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Upload Article</h3>
                    <X className="text-slate-300 cursor-pointer hover:text-slate-600" onClick={() => setIsArticleModalOpen(false)} />
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Article Title</label>
                        <input 
                            type="text" 
                            className="w-full p-4 bg-slate-50 border border-black/[0.05] rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                            placeholder="E.g., Master the Present Continuous"
                            value={articleTitle}
                            onChange={(e) => setArticleTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">PNG Image Resource</label>
                        <div className="relative group">
                            <input 
                                type="file" 
                                accept="image/png"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => setArticleFile(e.target.files[0])}
                            />
                            <div className="border-2 border-dashed border-black/[0.08] rounded-2xl p-8 text-center group-hover:border-blue-500 transition-all bg-slate-50">
                                <FileImage size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-blue-500" />
                                <p className="text-xs font-bold text-slate-500">
                                    {articleFile ? articleFile.name : "Select PNG Image"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        disabled={uploading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploading ? "Uploading..." : "Publish Article"}
                    </button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};

export default TutorQandA;