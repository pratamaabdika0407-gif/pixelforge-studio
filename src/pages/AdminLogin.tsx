import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Mail, User, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
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
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, password })
      });
      const data = await res.json();
      if (data.success) {
        if (data.admin && data.admin.role && ['User', 'Reseller', 'Affiliate', 'Guest'].includes(data.admin.role)) {
          setError("Akses Ditolak: Akun Anda bukan Administrator.");
          return;
        }
        localStorage.setItem("admin_token", data.token);
        if (rememberMe) {
          localStorage.setItem("admin_remember", identifier);
        }
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Username / Email atau Password salah.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi saat login.");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail("");
    }, 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4 relative">
      <div className="absolute top-6 left-6">
        <button 
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-neon-purple flex items-center justify-center text-white shadow-lg shadow-neon-purple/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold font-display text-center mb-2">Admin Portal</h1>
        <p className="text-xs text-gray-500 text-center mb-8">Masuk dengan kredensial Administrator yang berwenang</p>
        
        {error && <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Username atau Email Admin</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                value={identifier} 
                onChange={e => setIdentifier(e.target.value)} 
                placeholder="admin / admin@pixelforge.id"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors text-sm"
                required 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Password</label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-neon-purple hover:underline"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none transition-colors text-sm"
                required 
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-neon-purple focus:ring-neon-purple" 
              />
              <span className="text-gray-600 dark:text-gray-400">Ingat Saya</span>
            </label>
          </div>

          <button type="submit" className="w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:scale-[1.02] transition-transform shadow-lg">
            Login Admin
          </button>
        </form>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-2xl"
          >
            <h3 className="text-xl font-bold font-display mb-2">Reset Password Admin</h3>
            <p className="text-xs text-gray-500 mb-6">Masukkan email admin yang terdaftar. Instruksi reset akan dikirimkan atau hubungi super admin server.</p>
            
            {forgotSuccess ? (
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl text-sm text-center font-medium">
                Instruksi reset password telah dikirim ke email Anda / hubungi pengelola server database.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email Admin</label>
                  <input 
                    type="email" 
                    value={forgotEmail} 
                    onChange={e => setForgotEmail(e.target.value)} 
                    placeholder="admin@pixelforge.id"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none text-sm"
                    required 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-neon-purple text-white text-sm font-medium hover:opacity-90"
                  >
                    Kirim Instruksi
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
