import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, UserCheck, Lock, Mail, User } from "lucide-react";

export default function AdminSetup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin already exists
    fetch("/api/admin/check")
      .then(res => res.json())
      .then(data => {
        if (data.hasAdmin) {
          navigate("/admin/login");
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Setup gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
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
        className="w-full max-w-lg bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-accent-blue flex items-center justify-center text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold font-display text-center mb-2">Setup Super Admin</h1>
        <p className="text-gray-500 text-center text-sm mb-8">Buat akun Super Admin pertama untuk mengelola PixelForge Studio.</p>
        
        {error && <div className="p-3 mb-6 bg-red-100 text-red-600 rounded-xl text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Muhammad Abdika"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors text-sm"
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Username</label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="admin"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors text-sm"
                  required 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@pixelforge.id"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors text-sm"
                  required 
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors text-sm"
                required 
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors text-sm"
                required 
              />
            </div>
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-neon-purple text-white font-medium hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(192,38,211,0.4)]">
            Buat Super Admin & Masuk
          </button>
        </form>
      </motion.div>
    </div>
  );
}
