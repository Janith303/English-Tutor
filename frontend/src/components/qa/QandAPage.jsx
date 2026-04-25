import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Clock,
  CheckCircle,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  Maximize2
} from "lucide-react";
import AskQuestionModal from "./AskQuestionModal";
import logo from "../images/logo.jpg";

const QandAPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Questions");
  const [view, setView] = useState("qa");
  const [questions, setQuestions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuestions();
    fetchUserProfile();
    fetchArticles();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get("http://127.0.0.1:8000/api/wall-questions/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const response = await axios.get("http://127.0.0.1:8000/api/user/profile/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile.");
    }
  };

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get("http://127.0.0.1:8000/api/articles/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const getDisplayQuestions = () => {
    let filtered = questions.filter((q) => {
      const query = searchQuery.toLowerCase();
      const matchesContent = q.title.toLowerCase().includes(query) || q.body.toLowerCase().includes(query);
      const matchesTags = q.tags?.some(tag => tag.toLowerCase().includes(query));
      return matchesContent || matchesTags;
    });

    switch (activeTab) {
      case "My Questions":
        filtered = filtered.filter(q => q.is_owner);
        break;
      case "Unanswered":
        filtered = filtered.filter(q => !q.answers || q.answers.length === 0);
        break;
      case "Most Upvoted":
        filtered = [...filtered].sort((a, b) => b.votes - a.votes);
        break;
      default:
        break;
    }
    return filtered;
  };

  const displayQuestions = getDisplayQuestions();

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/wall-questions/${id}/upvote/`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(questions.map(q => 
        q.id === id ? { ...q, votes: response.data.current_votes, is_upvoted: response.data.is_upvoted } : q
      ));
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/wall-questions/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleNewQuestion = (newQuestion) => {
    setQuestions([newQuestion, ...questions]);
  };

  const handleViewPng = (imageUrl) => {
    const fullUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `http://127.0.0.1:8000${imageUrl}`;
    window.open(fullUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900">
      <nav className="bg-white border-b border-black/5 px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img src={logo} alt="logo" className="h-12" />
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-12 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={view === 'qa' ? "Search by keyword or tag..." : "Search articles..."}
            className="w-full bg-slate-100 border border-black/5 rounded-md py-2 pl-10 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
          {view === 'qa' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium shadow-lg transition-all active:scale-95"
            >
              <Plus size={18} /> Ask Question
            </button>
          ) : (
             currentUser?.role === 'TUTOR' && (
              <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium shadow-lg">
                <ImageIcon size={18} /> Post Article
              </button>
             )
          )}
          
          <div className="flex items-center gap-2 border-l border-black/5 pl-6 ml-2">
            <img
              src={`https://ui-avatars.com/api/?name=${currentUser?.full_name || 'User'}&background=0D8ABC&color=fff&bold=true`}
              alt="User"
              className="w-8 h-8 rounded-full border border-black/5"
            />
            <span className="font-bold text-sm text-slate-700">
              {currentUser?.full_name || "User"}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-slate-900 text-4xl font-black tracking-tighter mb-1">
              {view === 'qa' ? 'Q & A Wall' : 'Expert Articles'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {view === 'qa' ? 'Community feedback and expert guidance' : 'Visual resources posted by certified tutors'}
            </p>
          </div>

          <div className="flex bg-white/60 border border-black/10 p-1 rounded-xl shadow-sm w-fit backdrop-blur-sm">
            <button 
              onClick={() => setView('qa')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === 'qa' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
            >
              <MessageSquare size={16} /> Q&A Wall
            </button>
            <button 
              onClick={() => setView('articles')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${view === 'articles' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
            >
              <BookOpen size={16} /> Articles
            </button>
          </div>
        </div>

        {view === 'qa' && (
          <div className="flex gap-2 mb-10 bg-white/40 p-1.5 rounded-xl border border-black/5 w-fit">
            {["All Questions", "My Questions", "Unanswered", "Most Upvoted"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab ? "bg-white text-blue-600 shadow-sm border border-black/5" : "text-slate-500 hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {view === 'qa' ? (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : displayQuestions.map((q) => (
              <div 
                key={q.id} 
                className="bg-white border border-black/[0.06] rounded-3xl p-8 flex gap-8 hover:shadow-2xl transition-all cursor-pointer" 
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                 <div className="flex flex-col items-center gap-2 text-slate-300 bg-slate-50 rounded-2xl px-5 py-4 h-fit border border-black/[0.02]">
                    <ChevronUp className={`cursor-pointer transition-all ${q.is_upvoted ? 'text-blue-600 scale-125' : 'hover:text-blue-600'}`} onClick={(e) => handleUpvote(q.id, e)} size={28}/>
                    <span className="font-black text-2xl text-slate-800 tracking-tight">{q.votes}</span>
                    <ChevronDown className="cursor-pointer hover:text-red-400" size={28} />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-slate-900 leading-tight">{q.title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed line-clamp-3 mb-6">{q.body}</p>
                    
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold border-t border-black/[0.02] pt-5">
                      {/* --- ADDED STUDENT AVATAR HERE --- */}
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${q.author_name}&background=random&color=fff&bold=true`}
                          alt={q.author_name}
                          className="w-6 h-6 rounded-full border border-white shadow-sm"
                        />
                        <span className="text-slate-700 italic">Asked by {q.author_name}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full"><MessageSquare size={14} /> {q.answers?.length || 0} Comments</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {q.created_at_human}</span>
                      </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/40 border border-black/[0.05] rounded-[2.5rem] p-8 min-h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
              {articles.length > 0 ? (
                articles.map((art) => (
                  <div 
                    key={art.id} 
                    className="bg-white border border-black/[0.08] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer w-full max-w-[340px]"
                    onClick={() => handleViewPng(art.image)}
                  >
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      <img 
                        src={art.image} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 p-4 rounded-full shadow-lg scale-75 group-hover:scale-100 transition-transform duration-500">
                          <Maximize2 size={28} className="text-slate-900" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-slate-900 text-lg mb-1 leading-snug line-clamp-1">{art.title}</h4>
                      <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Tutor: {art.author_name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-32 opacity-40">
                  <BookOpen size={64} className="mx-auto mb-4" />
                  <p className="font-bold text-xl uppercase tracking-tighter italic">Library Empty</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {isModalOpen && <AskQuestionModal onClose={() => setIsModalOpen(false)} onQuestionAdded={handleNewQuestion} />}
    </div>
  );
};

export default QandAPage;