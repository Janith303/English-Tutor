import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Bell,
  Plus,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Clock,
  CheckCircle,
  Trash2,
  BookOpen,
  Image as ImageIcon
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

  // --- NEW: FUNCTION TO OPEN IMAGE ---
  const handleViewPng = (imageUrl) => {
    // If Django sends a relative path, ensure we prepend the base URL
    const fullUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `http://127.0.0.1:8000${imageUrl}`;
    window.open(fullUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <nav className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img src={logo} alt="logo" className="h-15" />
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-12 relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={view === 'qa' ? "Search by keyword or tag..." : "Search articles..."}
            className="w-full bg-slate-100 border-none rounded-md py-2 pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
          {view === 'qa' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors shadow-lg shadow-blue-100"
            >
              <Plus size={18} /> Ask Question
            </button>
          ) : (
             currentUser?.role === 'TUTOR' && (
              <button className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors shadow-lg">
                <ImageIcon size={18} /> Post Article
              </button>
             )
          )}
          
          <div className="flex items-center gap-2 cursor-pointer border-l pl-6 ml-2">
            <img
              src={`https://ui-avatars.com/api/?name=${currentUser?.full_name || 'User'}&background=0D8ABC&color=fff`}
              alt="User"
              className="w-8 h-8 rounded-full border shadow-sm"
            />
            <span className="font-bold text-sm text-slate-700">
              {currentUser ? currentUser.full_name : "Loading..."}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-8">
          <h2 className="text-slate-800 text-4xl font-black mb-2 tracking-tight">
            {view === 'qa' ? 'Q & A Wall' : 'Expert Articles'}
          </h2>
          <p className="text-slate-500 font-medium">
            {view === 'qa' ? 'Ask questions and get feedback from peers and expert tutors' : 'Visual learning resources posted by our certified tutors'}
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {view === 'qa' ? (
            <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
              {["All Questions", "My Questions", "Unanswered", "Most Upvoted"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                  className={`px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab ? "bg-blue-600 text-white shadow-md shadow-blue-100 scale-105" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm w-fit md:ml-auto">
            <button 
              onClick={() => setView('qa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'qa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <MessageSquare size={16} /> Q&A Wall
            </button>
            <button 
              onClick={() => setView('articles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'articles' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <BookOpen size={16} /> Articles
            </button>
          </div>
        </div>

        {view === 'qa' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Wall...</p>
              </div>
            ) : displayQuestions.length > 0 ? (
              displayQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                >
                  <div className="p-7 flex gap-7">
                    <div className="flex flex-col items-center gap-1 text-slate-300 bg-slate-50 rounded-xl px-4 py-3 h-fit border border-slate-100">
                      <ChevronUp 
                        className={`cursor-pointer transition-all ${q.is_upvoted ? 'text-blue-600 scale-125' : 'hover:text-blue-600'}`} 
                        onClick={(e) => handleUpvote(q.id, e)}
                        size={24}
                      />
                      <span className="font-black text-xl text-slate-800">{q.votes}</span>
                      <ChevronDown className="cursor-pointer hover:text-red-400" size={24} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-slate-800 leading-tight">{q.title}</h3>
                      <p className="text-slate-600 line-clamp-2 mb-5 leading-relaxed text-sm">{q.body}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {q.tags && q.tags.map((tag) => (
                          <span key={tag} className="text-blue-700 text-[10px] font-black px-3 py-1 rounded-md bg-blue-50 border border-blue-100 uppercase tracking-tight">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-slate-400 text-xs font-medium border-t border-slate-50 pt-5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                              <img
                                src={`https://ui-avatars.com/api/?name=${q.author_name}&background=random`}
                                alt={q.author_name}
                                className="w-7 h-7 rounded-full border border-white shadow-sm"
                              />
                              <span className="font-bold text-slate-700 underline underline-offset-4 decoration-slate-200">Asked by {q.author_name}</span>
                          </div>
                          {q.is_owner && (
                            <button 
                              onClick={(e) => handleDelete(q.id, e)}
                              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete your question"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div className="flex gap-5">
                          <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                            <MessageSquare size={14} className="text-slate-400" /> {q.answers?.length || 0} Comments
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} /> {q.created_at_human}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedId === q.id && q.answers && q.answers.length > 0 && (
                    <div className="bg-slate-50 border-t p-8 space-y-5 animate-in slide-in-from-top-2 duration-300">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Expert & Student Feedback</h4>
                      {q.answers.map((ans) => (
                        <div 
                          key={ans.id} 
                          className={`p-5 rounded-2xl border ${ans.is_expert_answer ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-white border-slate-100'}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-sm text-slate-800">{ans.author_name}</span>
                              {ans.is_expert_answer && (
                                <span className="flex items-center gap-1 bg-blue-600 text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                                  <CheckCircle size={10} /> Verified Expert
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{ans.created_at_human}</span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">{ans.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-300 font-black text-xl uppercase tracking-tighter italic">Zero questions found</p>
                <p className="text-slate-400 text-sm mt-2">Try adjusting your search or switching filters.</p>
              </div>
            )}
          </div>
        ) : (
          /* ARTICLES GALLERY VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {articles.length > 0 ? (
              articles.map((art) => (
                <div key={art.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                  <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                    <img 
                      src={art.image} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      {/* --- FIX: ADDED ONCLICK TO OPEN PNG --- */}
                      <button 
                        onClick={() => handleViewPng(art.image)}
                        className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold shadow-xl active:scale-95 transition-all hover:bg-blue-50"
                      >
                        View PNG
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{art.title}</h4>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Posted by {art.author_name}</span>
                      <span>{art.created_at_human}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-lg">No articles posted yet.</p>
                <p className="text-slate-400 text-sm mt-1">Tutors can post visual guides in this section.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {isModalOpen && (
        <AskQuestionModal 
          onClose={() => setIsModalOpen(false)} 
          onQuestionAdded={handleNewQuestion}
        />
      )}
    </div>
  );
};

export default QandAPage;