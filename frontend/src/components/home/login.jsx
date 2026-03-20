import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Topnav";
import img from "../images/log.jpg";

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-0">
      <Navbar />

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 bg-white  shadow-2xl overflow-hidden min-h-[80vh]">
        {/* LEFT SIDE: HERO IMAGE */}
        <div className="relative hidden md:block w-full h-full">
          <img
            src={img}
            alt="University Students"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent" />
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex flex-col justify-center items-center p-8 md:p-16 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tight">
                Account Login
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form className="space-y-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-bold text-gray-700"
                  htmlFor="username"
                >
                  Username or Email
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="e.g., IT23194510@my.sliit.lk"
                  /* Pattern for SLIIT IT Students */
                  pattern="^IT[0-9]{8}@my\.sliit\.lk$"
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl outline-none transition
               focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20
               placeholder:text-gray-400 text-gray-900"
                  required
                />
              </div>
              {/* Password Field */}
              <div className="space-y-2">
                <label
                  className="text-sm font-bold text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition outline-none"
                  required
                />
              </div>

              {/* Forget Password as a normal link */}
              <Link
                to="/forgot-password"
                className="text-blue-600 font-semibold hover:underline text-sm transition"
              >
                Forgot Password?
              </Link>

              {/* Action Section: Login Button and Text Link */}
              <div className="flex flex-col items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition shadow-lg active:scale-95"
                >
                  Login
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              {["Google", "Apple"].map((provider) => (
                <button
                  key={provider}
                  className="flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  <img
                    src={`https://authjs.dev/img/providers/${provider.toLowerCase()}.svg`}
                    alt={provider}
                    className="h-5 w-5"
                  />
                  <span className="font-semibold text-gray-700">
                    {provider}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-blue-600 hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
