import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Navbar from "../Topnav";
import img from "../images/log.jpg";
import topIcon from "../images/icon.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Hit the login endpoint
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        email: email,
        password: password,
      });

      if (res.status === 200) {
        const { access, refresh, role } = res.data;

        // 2. Persist session data
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("role", role);

        // 3. Multi-role Navigation Logic
        switch (role) {
          case "ADMIN":
            navigate("/admin/dashboard");
            break;
          case "TUTOR":
          case "STUDENT_TUTOR":
            navigate("/tutor/dashboard");
            break;
          case "STUDENT":
            navigate("/dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err) {
      // Handles 401 Unauthorized or 500 Server Errors
      const msg = err.response?.data?.detail || "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-0">
      <Navbar />

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl overflow-hidden min-h-[85vh] rounded-3xl md:rounded-none">
        
        {/* LEFT SIDE: HERO IMAGE */}
        <div className="relative hidden md:block w-full h-full">
          <img
            src={img}
            alt="University Students"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/30 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h1 className="text-4xl font-black mb-4">Welcome Back to SpeakUni.</h1>
            <p className="text-blue-100 text-lg">Connect with expert tutors and master your English communication skills today.</p>
          </div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex flex-col justify-center items-center p-8 md:p-20 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-center text-center">
              <img src={topIcon} alt="Icon" className="h-16 w-auto mb-6 object-contain" />
              <h2 className="text-4xl font-black text-blue-900 tracking-tight">Account Login</h2>
              <p className="mt-2 text-gray-500 font-medium">Please enter your SLIIT credentials.</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl animate-shake">
                <AlertCircle size={20} />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="it23xxxxxx@my.sliit.lk"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-wider ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-gray-700"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" size="sm" className="text-blue-600 font-bold hover:underline text-sm transition">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white text-lg font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest text-[10px]">New to SpeakUni?</span></div>
            </div>

            <p className="text-center text-gray-500 font-medium">
              Join our community.{" "}
              <Link to="/signup" className="font-black text-blue-600 hover:text-blue-700 hover:underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}