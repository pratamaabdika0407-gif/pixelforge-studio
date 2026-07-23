import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/check")
      .then(res => res.json())
      .then(data => {
        if (!data.hasAdmin) {
          navigate("/setup");
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-neon-purple flex items-center justify-center text-white">
            <Lock className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold font-display text-center mb-8">Admin Portal</h1>
        
        {error && <div className="p-3 mb-6 bg-red-100 text-red-600 rounded-lg text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors"
              required 
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors"
              required 
            />
          </div>
          <button type="submit" className="w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:scale-[1.02] transition-transform">
            Login
          </button>
        </form>
      </motion.div>
    </div>
  );
}
