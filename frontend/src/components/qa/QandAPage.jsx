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
  Trash2, // Added Trash2 icon
} from "lucide-react";
import AskQuestionModal from "./AskQuestionModal";
import logo from "../images/logo.jpg";

const QandAPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Questions");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // 1. Fetch questions with Auth Token
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
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Upvoting with Auth Token
  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      alert("You must be logged in to upvote!");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/wall-questions/${id}/upvote/`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuestions(questions.map(q => 
        q.id === id ? { 
          ...q, 
          votes: response.data.current_votes, 
          is_upvoted: response.data.is_upvoted 
        } : q
      ));
    } catch (error) {
      console.error("Upvote failed:", error);
    }
  };

  // 3. NEW: Handle Deleting Question
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevents the accordion from toggling
    
    if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/wall-questions/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update UI by removing the question from state
      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete the question. You might not have permission.");
    }
  };

  const handleNewQuestion = (newQuestion) => {
    setQuestions([newQuestion, ...questions]);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img src={logo} alt="logo" className="h-15" />
          </Link>
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

      <main className="max-w-5xl mx-auto py-10 px-6">
        <header className="mb-8">
          <h2 className="text-slate-700 text-3xl font-bold mb-2">Q & A Wall</h2>
          <p className="text-slate-500">Ask questions and get feedback from peers and expert tutors</p>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-lg border w-fit shadow-sm">
          {["All Questions", "My Questions", "Unanswered", "Most Upvoted"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-slate-500 py-10">Loading questions...</p>
          ) : questions.length > 0 ? (
            questions.map((q) => (
              <div
                key={q.id}
                className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <div className="p-6 flex gap-6">
                  {/* Upvote Section */}
                  <div className="flex flex-col items-center gap-1 text-slate-400 bg-slate-50 rounded-lg px-3 py-2 h-fit">
                    <ChevronUp 
                      className={`cursor-pointer transition-colors ${q.is_upvoted ? 'text-blue-600 scale-110' : 'hover:text-blue-600'}`} 
                      onClick={(e) => handleUpvote(q.id, e)}
                    />
                    <span className="font-bold text-lg text-slate-800">{q.votes}</span>
                    <ChevronDown className="cursor-pointer hover:text-red-400" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-slate-600">
                      {q.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-2 mb-4 leading-relaxed">{q.body}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {q.tags && q.tags.map((tag) => (
                        <span key={tag} className="text-blue-600 text-xs font-semibold px-2 py-1 rounded bg-blue-50 border border-blue-100 capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-sm">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${q.author_name}&background=random`}
                          alt={q.author_name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium text-slate-700">{q.author_name}</span>
                        
                        {/* DELETE BUTTON: Only visible to the owner */}
                        {q.is_owner && (
                          <button 
                            onClick={(e) => handleDelete(q.id, e)}
                            className="ml-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={14} /> {q.answers ? q.answers.length : 0} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {q.created_at_human}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- EXPERT ANSWERS SECTION --- */}
                {expandedId === q.id && q.answers && q.answers.length > 0 && (
                  <div className="bg-slate-50 border-t p-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Responses</h4>
                    {q.answers.map((ans) => (
                      <div 
                        key={ans.id} 
                        className={`p-4 rounded-lg border shadow-sm ${
                          ans.is_expert_answer 
                          ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' 
                          : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{ans.author_name}</span>
                            {ans.is_expert_answer && (
                              <span className="flex items-center gap-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                <CheckCircle size={10} /> Verified Expert
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{ans.created_at_human}</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ans.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-10">No questions found. Be the first to ask!</p>
          )}
        </div>
      </main>

      {/* Modal */}
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