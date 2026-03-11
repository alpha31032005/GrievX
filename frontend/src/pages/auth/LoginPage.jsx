import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const LoginPage = () => {
  const { isDark } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === "citizen") navigate("/citizen/dashboard");
      else if (user.role === "admin" || user.role === "chief") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/auth/request-otp", { email });
      setOtpSent(true);
      setSuccess("OTP sent to your email! Valid for 10 minutes.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      const { token, user } = response.data;
      
      // Store token and update context
      localStorage.setItem("token", token);
      
      // Force page reload to update auth state
      window.location.href = user.role === "citizen" 
        ? "/citizen/dashboard" 
        : user.role === "admin" || user.role === "chief" 
          ? "/admin/dashboard" 
          : "/";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission based on login method
  const handleSubmit = async (e) => {
    if (loginMethod === "password") {
      handlePasswordLogin(e);
    } else if (otpSent) {
      handleVerifyOTP(e);
    } else {
      handleRequestOTP(e);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 opacity-20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-400 opacity-20 blur-3xl rounded-full"></div>
      </div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-10 transform animate-fadeInUp backdrop-blur-xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg transform hover:scale-110 transition">
            🏛️
          </div>
          <h1 className="text-3xl font-bold mt-4 text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Login to continue to GrievX
          </p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("password");
              setError("");
              setSuccess("");
              setOtpSent(false);
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              loginMethod === "password"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <FiLock className="inline mr-2" />
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("otp");
              setError("");
              setSuccess("");
              setOtpSent(false);
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              loginMethod === "otp"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <FiKey className="inline mr-2" />
            OTP
          </button>
        </div>

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Email Field - Always shown */}
          <div className="relative">
            <FiMail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={otpSent && loginMethod === "otp"}
              autoComplete="email"
              className="w-full px-10 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field - Show only for password login */}
          {loginMethod === "password" && (
            <div className="relative">
              <FiLock className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-10 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition"
              />

              {/* Show/Hide Button */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-3 right-3 text-gray-500 dark:text-gray-300"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          )}

          {/* OTP Field - Show only after OTP is sent */}
          {loginMethod === "otp" && otpSent && (
            <div className="relative">
              <FiKey className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full px-10 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition text-center text-2xl tracking-widest font-mono"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md transform hover:scale-[1.02] transition flex items-center justify-center gap-2"
          >
            {loading ? (
              "Processing..."
            ) : loginMethod === "password" ? (
              <>Login <FiArrowRight /></>
            ) : otpSent ? (
              <>Verify OTP <FiArrowRight /></>
            ) : (
              <>Send OTP <FiArrowRight /></>
            )}
          </button>

          {/* Resend OTP Button */}
          {loginMethod === "otp" && otpSent && (
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Request New OTP
            </button>
          )}
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
            OR
          </span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Signup Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>

        {/* Forgot Password */}
        <p className="text-center mt-3">
          <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 transition">
            Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
