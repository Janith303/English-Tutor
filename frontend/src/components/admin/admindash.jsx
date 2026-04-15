import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { 
  Users, UserCheck, Clock, GraduationCap, 
  LayoutDashboard, Settings, Bell, LogOut, Search, 
  CheckCircle, XCircle, MoreVertical, ShieldCheck,
  FileText, Play, ExternalLink, Loader2, Mail, BookOpen, User, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingRequests: 0, approvedTutors: 0, activeStudents: 0 });
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null); // For Video Modal
  
  const navigate = useNavigate();
  const location = useLocation();

  // Path detection to handle active tab
  const pathParts = location.pathname.split("/").filter(Boolean);
  const activeTab = pathParts[pathParts.length - 1] || "dashboard";

  const API_BASE = "http://127.0.0.1:8000/api";
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchStats();
    if (activeTab !== "dashboard" && activeTab !== "admin") {
      fetchTabData();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/stats/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) { console.error("Stats fetch failed"); }
  };

  const fetchTabData = async () => {
    setLoading(true);
    let endpoint = "";
    if (activeTab === "requests") endpoint = "/admin/requests/";
    if (activeTab === "users") endpoint = "/admin/users/";
    if (activeTab === "student-tutors") endpoint = "/admin/users/?role=STUDENT_TUTOR";

    try {
      const res = await axios.get(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListData(res.data || []);
    } catch (err) {
      setListData([]);
      console.error("Data fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTutorAction = async (id, action) => {
    try {
      await axios.post(`${API_BASE}/admin/approve-tutor/${id}/`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStats();
      fetchTabData();
    } catch (err) { alert("Action failed"); }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-full z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">English Tutor<span className="text-slate-900">Admin</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard Overview" />
          <NavItem to="/admin/requests" icon={<Clock size={20}/>} label="Tutor Requests" badge={stats.pendingRequests} />
          <NavItem to="/admin/student-tutors" icon={<UserCheck size={20}/>} label="Student Tutors" />
          <NavItem to="/admin/users" icon={<Users size={20}/>} label="All Users" />
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
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
                      ) : (
                         <UserTable data={listData} />
                      )}
                      {listData.length === 0 && <EmptyState label={`No ${activeTab} data available.`} />}
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

function TutorRequestsGrid({ data, onAction, onViewVideo }) {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const getFileType = (url) => {
    if (!url) return "none";
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
                  {req.full_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{req.full_name}</h4>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail size={12} />
                    <span className="text-xs font-bold">{req.email}</span>
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

      {/* --- DETAIL DRAWER --- */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-xl bg-white h-full shadow-2xl p-10 overflow-y-auto">
              <button onClick={() => setSelectedRequest(null)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><XCircle size={32}/></button>
              
              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Verification Profile</h3>
                <p className="text-blue-600 font-bold text-sm mt-1">{selectedRequest.email}</p>
              </div>

              <div className="space-y-8">
                <section className="grid grid-cols-2 gap-4">
                  <DetailItem label="Full Name" value={selectedRequest.full_name} icon={<User size={14}/>} />
                  <DetailItem label="Subject Area" value={selectedRequest.teaching_areas} icon={<BookOpen size={14}/>} />
                </section>

                <section>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Professional Bio</label>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-slate-600 text-sm leading-relaxed">"{selectedRequest.bio}"</div>
                </section>

                <section className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase text-blue-600 tracking-widest border-b border-blue-50 pb-2">Verification Assets</h5>
                  
                  <button onClick={() => onViewVideo(selectedRequest.video)} className="w-full flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-600 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><Play size={20}/></div>
                      <span className="font-bold text-slate-700">Play Video Introduction</span>
                    </div>
                    <ExternalLink size={18} className="text-slate-300" />
                  </button>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity Proof (ID Card)</label>
                    {getFileType(selectedRequest.identity_proof) === 'image' ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
                        <img src={selectedRequest.identity_proof} alt="ID" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <a href={selectedRequest.identity_proof} target="_blank" rel="noreferrer" className="bg-white p-3 rounded-full text-blue-600 shadow-xl"><ExternalLink size={20}/></a>
                        </div>
                      </div>
                    ) : (
                      <a href={selectedRequest.identity_proof} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-5 bg-white border-2 border-red-50 rounded-2xl hover:border-red-500 transition-all group">
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

function UserTable({ data }) {
  return (
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
  );
}

// Helper UI Components
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
  return <div className="h-64 flex items-center justify-center text-slate-400 font-bold italic bg-white rounded-[2.5rem] border border-dashed border-slate-200">{label}</div>;
}