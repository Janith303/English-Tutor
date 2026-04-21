import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { 
  Users, UserCheck, Clock, GraduationCap, 
  LayoutDashboard, Settings, Bell, LogOut, Search, 
  CheckCircle, XCircle, MoreVertical, ShieldCheck,
  FileText, Play, ExternalLink, Loader2, Mail, BookOpen, User, Image as ImageIcon,
  Plus, Edit3, Trash2, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingRequests: 0, approvedTutors: 0, activeStudents: 0, pendingCourseApprovals: 0 });
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const activeTab = pathParts[pathParts.length - 1] || "dashboard";

  const API_BASE = "http://127.0.0.1:8000/api";

  const getToken = () => localStorage.getItem("access_token");
  const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    fetchStats();
    if (activeTab !== "dashboard" && activeTab !== "admin") {
      fetchTabData();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/stats/`, {
        headers: getAuthHeader()
      });
      setStats(res.data);
    } catch (err) { 
      console.error("Stats fetch failed", err.response?.status);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    let endpoint = "";
    if (activeTab === "requests") endpoint = "/admin/requests/";
    if (activeTab === "users") endpoint = "/admin/users/";
    if (activeTab === "student-tutors") endpoint = "/admin/users/?role=STUDENT_TUTOR";
    if (activeTab === "placement-questions") endpoint = "/create-questions/";
    if (activeTab === "question-approval") endpoint = "/admin/questions/pending/";
    if (activeTab === "course-approval") endpoint = "/admin/courses/pending/";

    if (!endpoint) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}${endpoint}`, {
        headers: getAuthHeader()
      });
      setListData(res.data || []);
    } catch (err) {
      setListData([]);
      console.error("Data fetch failed", err.response?.status);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTutorAction = async (id, action) => {
    try {
      await axios.post(`${API_BASE}/admin/approve-tutor/${id}/`, { action }, {
        headers: getAuthHeader()
      });
      fetchStats();
      fetchTabData();
    } catch (err) { 
      console.error("Action failed", err.response?.status);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Action failed");
      }
    }
  };

  const handleQuestionAction = async (id, action) => {
    try {
      const endpoint = action === 'approve' 
        ? `/admin/questions/${id}/approve/`
        : `/admin/questions/${id}/reject/`;
      await axios.patch(`${API_BASE}${endpoint}`, {}, {
        headers: getAuthHeader()
      });
      fetchTabData();
    } catch (err) { 
      console.error("Action failed", err.response?.status);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Action failed");
      }
    }
  };

  const handleCourseApproval = async (id, action, reason = '') => {
    try {
      const endpoint = action === 'approve' 
        ? `/admin/courses/${id}/approve/`
        : `/admin/courses/${id}/reject/`;
      const payload = action === 'reject' ? { reason: reason || 'Course does not meet quality standards' } : {};
      await axios.patch(`${API_BASE}${endpoint}`, payload, {
        headers: getAuthHeader()
      });
      fetchTabData();
    } catch (err) { 
      console.error("Action failed", err.response?.status);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Action failed");
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-full z-20">
        <div className="p-3">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">English Tutor<span className="text-slate-900">Admin</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard Overview" />
          <NavItem to="/admin/requests" icon={<Clock size={20}/>} label="Tutor Requests" badge={stats.pendingRequests} />
          {/* <NavItem to="/admin/student-tutors" icon={<UserCheck size={20}/>} label="All Tutors" /> */}
          <NavItem to="/admin/users" icon={<Users size={20}/>} label="All Users" />
          <NavItem to="/admin/placement-questions" icon={<BookOpen size={20}/>} label="Placement Questions" />
          <NavItem to="/admin/question-approval" icon={<CheckCircle size={20}/>} label="Question Bank Approval" />
          <NavItem to="/admin/course-approval" icon={<GraduationCap size={20}/>} label="Course Content Approval" badge={stats.pendingCourseApprovals} />
          <button 
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="flex items-center gap-3 w-full px-4 py-4 text-slate-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-2 w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search database..." className="bg-transparent border-none outline-none ml-3 text-sm font-medium w-full" />
          </div>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">A</div>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" || activeTab === "admin" ? (
                <>
                  <header className="mb-10">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Pulse</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Real-time statistics for the English learning community.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard label="Total Users" value={stats.totalUsers} icon={<Users />} color="bg-blue-600" delay={0.1}/>
                    <StatsCard label="Pending" value={stats.pendingRequests} icon={<Clock />} color="bg-amber-500" delay={0.2}/>
                    <StatsCard label="Verified Tutors" value={stats.approvedTutors} icon={<ShieldCheck />} color="bg-green-500" delay={0.3}/>
                    <StatsCard label="Active Students" value={stats.activeStudents} icon={<GraduationCap />} color="bg-indigo-600" delay={0.4}/>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-slate-900 mb-8 capitalize">{activeTab.replace('-', ' ')}</h2>
                  
                  {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-blue-600 gap-4">
                      <Loader2 className="animate-spin" size={40} />
                      <p className="font-bold text-slate-400 text-xs uppercase tracking-widest">Fetching records...</p>
                    </div>
                  ) : (
                    <>
{activeTab === "requests" ? (
                          <TutorRequestsGrid 
                             data={listData} 
                             onAction={handleTutorAction} 
                             onViewVideo={(url) => setSelectedVideo(url)} 
                          />
                       ) : activeTab === "placement-questions" ? (
                          <PlacementQuestionManager data={listData} onRefresh={fetchTabData} />
                       ) : activeTab === "question-approval" ? (
                          <QuestionApprovalGrid data={listData} onAction={handleQuestionAction} />
                       ) : activeTab === "course-approval" ? (
                          <CourseApprovalGrid data={listData} onAction={handleCourseApproval} />
                       ) : (
                          <UserManager data={listData} onRefresh={fetchTabData} />
                       )}
                      
                      {listData.length === 0 && <EmptyState label={`No ${activeTab.replace('-', ' ')} data available.`} />}
                    </>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- GLOBAL VIDEO MODAL --- */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVideo(null)} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-black w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <video src={selectedVideo} controls autoPlay className="w-full h-full" />
              <button onClick={() => setSelectedVideo(null)} className="absolute top-6 right-6 p-2 bg-white/20 text-white rounded-full"><XCircle /></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

function UserManager({ data, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "ADMIN",
    is_verified: true, // Auto-verify users created by Admin
    onboarding_status: "REGISTER" // Assume admin setup is complete
  });

  const roles = [/*"STUDENT", "TUTOR", "STUDENT_TUTOR",*/ "ADMIN"];
  const API_BASE = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access_token");

  const handleOpenModal = () => {
    setSubmitError(null);
    setFormData({
      full_name: "",
      email: "",
      password: "",
      role: "ADMIN",
      is_verified: true,
      onboarding_status: "REGISTER"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      await axios.post(`${API_BASE}/register/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      onRefresh(); 
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const formattedError = typeof errorData === 'string' 
            ? errorData 
            : JSON.stringify(errorData).replace(/[{}[\]"]/g, ' ').trim();
        setSubmitError(`Failed to create user: ${formattedError}`);
      } else {
        setSubmitError("Network Error. Check server connection.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-500 font-medium">Manage platform users and roles.</p>
        <button 
          onClick={handleOpenModal} 
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">User Details</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Role</th>
              <th className="px-8 py-5 text-right uppercase text-[10px] font-black text-slate-400 px-8">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/20 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-slate-900">{user.full_name}</p>
                  <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                </td>
                <td className="px-8 py-6 uppercase text-[10px] font-black">
                  <span className={`px-2 py-1 rounded-md ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-right"><MoreVertical className="text-slate-300 inline cursor-pointer hover:text-slate-900" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD USER MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-black mb-6 text-slate-900">Create New User</h3>
              
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Creation Failed</p>
                    <p className="text-sm text-red-600 mt-1 capitalize">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Full Name</label>
                  <input 
                    type="text" value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="E.g., John Doe"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" 
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Email Address</label>
                  <input 
                    type="email" value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="mail@gmail.com"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" 
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Temporary Password</label>
                  <input 
                    type="password" value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Create a secure password"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" 
                    required minLength="8"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Account Role</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    {roles.map(role => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 hover:text-slate-700 rounded-2xl font-black transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 hover:scale-[1.02]">
                  Create Account
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlacementQuestionManager({ data, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [submitError, setSubmitError] = useState(null); 
  
  const [formData, setFormData] = useState({
    text: "", category: "GRAMMAR",
    option_a: "", option_b: "", option_c: "", option_d: "",
    correct_option: "A"
  });

  const categories = ["GRAMMAR", "VOCABULARY", "WRITING", "SPEAKING", "IELTS"];
  const API_BASE = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access_token");

  const handleOpenModal = (question = null) => {
    setSubmitError(null); 
    if (question) {
      setEditingQuestion(question);
      setFormData(question);
    } else {
      setEditingQuestion(null);
      setFormData({ text: "", category: "GRAMMAR", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null); 
    const method = editingQuestion ? "PUT" : "POST";
    const url = editingQuestion 
        ? `${API_BASE}/create-questions/${editingQuestion.id}/` 
        : `${API_BASE}/create-questions/`;

    try {
      await axios({
        method, url, data: formData,
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      onRefresh(); 
    } catch (err) { 
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const formattedError = typeof errorData === 'string' 
            ? errorData 
            : JSON.stringify(errorData).replace(/[{}[\]"]/g, ' ').trim();
        setSubmitError(`Django Validation Error: ${formattedError}`);
      } else {
        setSubmitError("Network Error. Check if your Django server is running.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(`${API_BASE}/create-questions/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) { alert("Delete failed"); }
  };

  if (data.length === 0 && !isModalOpen) {
    return (
      <div className="text-center">
         <EmptyState label="No placement questions found in the database." />
         <button onClick={() => handleOpenModal()} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 mx-auto hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
          <Plus size={18} /> Add Your First Question
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-500 font-medium">Manage entry-level evaluation questions.</p>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
          <Plus size={18} /> Add New Question
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.map((q) => (
          <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
            <div className="flex-1 pr-6">
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md mb-2 inline-block">{q.category}</span>
              <p className="font-bold text-slate-900 leading-tight mb-3">{q.text}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 <p className={`text-xs p-2 rounded-lg ${q.correct_option === 'A' ? 'bg-green-50 text-green-700 font-bold' : 'bg-slate-50 text-slate-500'}`}>A: {q.option_a}</p>
                 <p className={`text-xs p-2 rounded-lg ${q.correct_option === 'B' ? 'bg-green-50 text-green-700 font-bold' : 'bg-slate-50 text-slate-500'}`}>B: {q.option_b}</p>
                 <p className={`text-xs p-2 rounded-lg ${q.correct_option === 'C' ? 'bg-green-50 text-green-700 font-bold' : 'bg-slate-50 text-slate-500'}`}>C: {q.option_c}</p>
                 <p className={`text-xs p-2 rounded-lg ${q.correct_option === 'D' ? 'bg-green-50 text-green-700 font-bold' : 'bg-slate-50 text-slate-500'}`}>D: {q.option_d}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleOpenModal(q)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"><Edit3 size={18}/></button>
              <button onClick={() => handleDelete(q.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-black mb-6 text-slate-900">{editingQuestion ? "Edit Question" : "New Question"}</h3>
              
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Save Failed</p>
                    <p className="text-sm text-red-600 mt-1 capitalize">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Question Text</label>
                  <textarea 
                    value={formData.text} 
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 h-24 resize-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <div key={opt}>
                      <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Option {opt.toUpperCase()}</label>
                      <input 
                        type="text" value={formData[`option_${opt}`]} 
                        onChange={(e) => setFormData({...formData, [`option_${opt}`]: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl p-4 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100" 
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <label className="text-xs font-black uppercase text-slate-400 mb-2 block">Select Correct Answer</label>
                  <div className="flex gap-4">
                    {['A', 'B', 'C', 'D'].map(val => (
                      <button 
                        key={val} type="button"
                        onClick={() => setFormData({...formData, correct_option: val})}
                        className={`flex-1 py-4 rounded-xl font-black transition-all ${formData.correct_option === val ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 hover:text-slate-700 rounded-2xl font-black transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 hover:scale-[1.02]">
                  {editingQuestion ? "Update Question" : "Create Question"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TutorRequestsGrid({ data, onAction, onViewVideo }) {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const getFullName = (req) => req?.full_name || req?.user?.full_name || "Unknown Applicant";
  const getEmail = (req) => req?.email || req?.user?.email || "No Email Provided";
  const getIdentityProof = (req) => req?.identity_proof || req?.user?.identity_proof;
  const getVideo = (req) => req?.video || req?.user?.video;

  const buildMediaUrl = (path) => {
    if (!path) return "#";
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  const getFileType = (url) => {
    if (!url || url === "#") return "none";
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return 'image';
    return extension === 'pdf' ? 'pdf' : 'other';
  };

  if (data.length === 0) return <EmptyState label="No pending tutor requests." />;

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {data.map((req) => (
          <motion.div key={req.id} layout className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">
                  {getFullName(req).charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{getFullName(req)}</h4>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail size={12} />
                    <span className="text-xs font-bold">{getEmail(req)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(req)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <BookOpen size={14} />
              <p className="text-xs font-black uppercase tracking-widest">{req.teaching_areas}</p>
            </div>

            <p className="text-slate-500 text-sm mb-8 font-medium italic line-clamp-2">"{req.bio || "No bio provided."}"</p>

            <div className="flex gap-3">
              <button onClick={() => setSelectedRequest(req)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">Review Application</button>
              <button onClick={() => onAction(req.id, 'APPROVE')} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">Approve</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-xl bg-white h-full shadow-2xl p-10 overflow-y-auto">
              <button onClick={() => setSelectedRequest(null)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><XCircle size={32}/></button>
              
              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Verification Profile</h3>
                <p className="text-blue-600 font-bold text-sm mt-1">{getEmail(selectedRequest)}</p>
              </div>

              <div className="space-y-8">
                <section className="grid grid-cols-2 gap-4">
                  <DetailItem label="Full Name" value={getFullName(selectedRequest)} icon={<User size={14}/>} />
                  <DetailItem label="Subject Area" value={selectedRequest.teaching_areas} icon={<BookOpen size={14}/>} />
                </section>

                <section>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Professional Bio</label>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-slate-600 text-sm leading-relaxed">"{selectedRequest.bio}"</div>
                </section>

                <section className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b border-blue-50 pb-2">Verification Assets</h5>
                  
                  <button onClick={() => onViewVideo(buildMediaUrl(getVideo(selectedRequest)))} className="w-full flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-600 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><Play size={20}/></div>
                      <span className="font-bold text-slate-700">Play Video Introduction</span>
                    </div>
                    <ExternalLink size={18} className="text-slate-300" />
                  </button>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity Proof (ID Card)</label>
                    {getFileType(getIdentityProof(selectedRequest)) === 'image' ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
                        <img src={buildMediaUrl(getIdentityProof(selectedRequest))} alt="ID" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <a href={buildMediaUrl(getIdentityProof(selectedRequest))} target="_blank" rel="noreferrer" className="bg-white p-3 rounded-full text-blue-600 shadow-xl"><ExternalLink size={20}/></a>
                        </div>
                      </div>
                    ) : (
                      <a href={buildMediaUrl(getIdentityProof(selectedRequest))} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-5 bg-white border-2 border-red-50 rounded-2xl hover:border-red-500 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all"><FileText size={20}/></div>
                          <span className="font-bold text-slate-700">Open Student ID (PDF)</span>
                        </div>
                        <ExternalLink size={18} className="text-slate-300" />
                      </a>
                    )}
                  </div>
                </section>

                <div className="pt-8 flex gap-4 border-t border-slate-100">
                  <button onClick={() => { onAction(selectedRequest.id, 'APPROVE'); setSelectedRequest(null); }} className="flex-1 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black shadow-xl shadow-blue-100">Confirm & Verify</button>
                  <button onClick={() => { onAction(selectedRequest.id, 'REJECT'); setSelectedRequest(null); }} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-[1.8rem] font-black hover:bg-red-50">Reject</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
      isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
    }`}>
      <div className="flex items-center gap-4">
        <span className="transition-transform group-hover:scale-110">{icon}</span>
        <span className="font-bold text-sm">{label}</span>
      </div>
      {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
    </NavLink>
  );
}

function StatsCard({ label, value, icon, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>{icon}</div>
      <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p><h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4></div>
    </motion.div>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-400">{icon}</span>
        <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      </div>
      <p className="font-bold text-slate-900 truncate">{value || "Not Set"}</p>
    </div>
  );
}

function EmptyState({ label }) {
  return <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-bold italic bg-white rounded-[2.5rem] border border-dashed border-slate-200">{label}</div>;
}

function QuestionApprovalGrid({ data, onAction }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.map((question) => (
        <div key={question.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">Pending</span>
            <span className="text-xs font-bold text-slate-400 uppercase">{question.category}</span>
          </div>
          
          <h3 className="font-bold text-slate-900 text-lg mb-4">{question.question_text}</h3>
          
          <div className="space-y-2 mb-6">
            {question.options?.map((opt, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl text-sm font-medium ${
                  opt.is_correct 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                {String.fromCharCode(65 + idx)}. {opt.option_text}
                {opt.is_correct && <span className="ml-2 text-xs font-bold">(Correct)</span>}
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => onAction(question.id, 'approve')}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onAction(question.id, 'reject')}
              className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CourseApprovalGrid({ data, onAction }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
  };

  const handleApprove = () => {
    if (selectedCourse) {
      onAction(selectedCourse.id, 'approve');
      setSelectedCourse(null);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedCourse) {
      onAction(selectedCourse.id, 'reject', rejectReason);
      setSelectedCourse(null);
      setShowRejectModal(false);
      setRejectReason("");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">Pending Approval</span>
              <span className="text-xs font-bold text-slate-400 uppercase">{course.category}</span>
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2">{course.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{course.summary}</p>

            <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{course.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{course.totalLessons} Lessons</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewDetails(course)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Details Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCourse(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => setSelectedCourse(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>

              <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedCourse.title}</h3>
              <p className="text-slate-500 mb-4">{selectedCourse.summary}</p>

              <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">{selectedCourse.category}</span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">{selectedCourse.level}</span>
                <span>{selectedCourse.totalLessons} Lessons</span>
              </div>

              {/* Course Structure - Full Overview */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-slate-400 uppercase mb-3">Course Structure - Full Overview</h4>

                {/* Course Stats */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <span className="block text-xl font-black text-blue-600">{selectedCourse.chapters?.length || 0}</span>
                    <span className="text-xs text-slate-400">Chapters</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <span className="block text-xl font-black text-blue-600">{selectedCourse.totalLessons}</span>
                    <span className="text-xs text-slate-400">Lessons</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <span className="block text-xl font-black text-green-600">{selectedCourse.duration_hours}</span>
                    <span className="text-xs text-slate-400">Hours</span>
                  </div>
                </div>

                {/* Chapters and Lessons List */}
                <div className="space-y-6">
                  {selectedCourse.chapters?.map((chapter) => (
                    <div key={chapter.id} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                      {/* Chapter Header */}
                      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                        <h5 className="font-bold">Chapter {chapter.order}: {chapter.title}</h5>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">{chapter.lessons?.length || 0} Lessons</span>
                      </div>

                      {/* Lessons List */}
                      <div className="p-4 bg-white">
                        {chapter.lessons?.length > 0 ? (
                          <div className="space-y-4">
                            {chapter.lessons?.map((lesson) => (
                              <div key={lesson.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                {/* Lesson Header */}
                                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center font-bold">{lesson.order}</span>
                                    <div>
                                      <span className="font-bold text-slate-700 block">{lesson.title}</span>
                                      {lesson.description && <span className="text-xs text-slate-500">{lesson.description}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">{lesson.duration}</span>
                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded">+{lesson.credits_awarded} Credits</span>
                                  </div>
                                </div>

                                {/* Lesson Content */}
                                <div className="p-4 border-t border-slate-100">
                                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Lesson Content:</div>
                                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap min-h-[60px]">
                                    {lesson.content && lesson.content.trim() ? lesson.content : 'No lesson content provided'}
                                  </div>
                                </div>

                                {/* Quizzes Block */}
                                {lesson.quizzes && lesson.quizzes.length > 0 && (
                                  <div className="p-4 border-t border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Quizzes ({lesson.quizzes.length}):</div>
                                    <div className="space-y-3">
                                      {lesson.quizzes.map((quiz) => (
                                        <div key={quiz.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-purple-700">{quiz.title}</span>
                                            <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-600">
                                              Pass: {quiz.passing_score}%
                                            </span>
                                          </div>
                                          {quiz.instructions && (
                                            <p className="text-xs text-purple-600 mt-1">{quiz.instructions}</p>
                                          )}
                                          {quiz.questions && quiz.questions.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                              <div className="text-xs font-semibold text-purple-500">Questions ({quiz.questions.length}):</div>
                                              {quiz.questions.map((q, qIdx) => {
                                                const correctLabel = q.correct_option === 'A' ? q.option_a : q.correct_option === 'B' ? q.option_b : q.correct_option === 'C' ? q.option_c : q.option_d;
                                                return (
                                                <div key={q.id} className="bg-white border border-purple-100 rounded p-2 text-xs">
                                                  <div className="font-medium text-purple-700">{qIdx + 1}. {q.question_text}</div>
                                                  <div className="mt-1 grid grid-cols-2 gap-1 text-purple-600">
                                                    <span className={q.correct_option === 'A' ? 'font-bold text-green-600' : ''}>A. {q.option_a}</span>
                                                    <span className={q.correct_option === 'B' ? 'font-bold text-green-600' : ''}>B. {q.option_b}</span>
                                                    <span className={q.correct_option === 'C' ? 'font-bold text-green-600' : ''}>C. {q.option_c}</span>
                                                    <span className={q.correct_option === 'D' ? 'font-bold text-green-600' : ''}>D. {q.option_d}</span>
                                                  </div>
                                                  <div className="mt-1 text-green-600 font-semibold">Correct: {q.correct_option} ({correctLabel})</div>
                                                  {q.explanation && (
                                                    <div className="mt-1 text-purple-400 italic">Explanation: {q.explanation}</div>
                                                  )}
                                                </div>
                                              );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Media Uploads Block */}
                                {(lesson.media?.image || lesson.media?.video_file || lesson.media?.video_embed_url || lesson.media?.lesson_link_url) && (
                                  <div className="p-4 border-t border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Media & Resources:</div>
                                    <div className="space-y-2">
                                      {lesson.media?.image && (
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 flex items-center gap-2">
                                          <span className="text-indigo-600 text-sm">📷 Image Attached</span>
                                        </div>
                                      )}
                                      {lesson.media?.video_file && (
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 flex items-center gap-2">
                                          <span className="text-indigo-600 text-sm">🎬 Video File Attached</span>
                                        </div>
                                      )}
                                      {lesson.media?.video_embed_url && (
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                                          <span className="text-indigo-600 text-xs">🔗 Video Embed: {lesson.media.video_embed_url}</span>
                                        </div>
                                      )}
                                      {lesson.media?.lesson_link_url && (
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                                          <span className="text-indigo-600 text-xs">🔗 External Link: {lesson.media.lesson_link_url}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm italic">No lessons in this chapter</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {(!selectedCourse.chapters || selectedCourse.chapters.length === 0) && (
                  <p className="text-slate-400 text-center py-4">No chapters available</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                  Approve & Publish
                </button>
                <button
                  onClick={handleRejectClick}
                  className="flex-1 py-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedCourse && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRejectModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
              <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>

              <h3 className="text-xl font-black text-slate-900 mb-4">Reject Course</h3>
              <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting "{selectedCourse.title}"</p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-32 bg-slate-50 border-none rounded-xl p-4 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 resize-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}