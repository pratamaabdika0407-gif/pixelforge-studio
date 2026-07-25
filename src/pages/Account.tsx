import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Shield, Bell, Heart, Settings, HelpCircle, Info, FileText, Lock, LogOut, ChevronRight, Edit3, ShoppingBag, CreditCard, CheckCircle2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import ThemeSwitch from "../components/ThemeSwitch";
import { useLanguage } from "../context/LanguageContext";

export default function Account() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Muhammad Abdika Pratama",
    email: "muhammadabdikapratama7@gmail.com",
    phone: "+62 838-9478-1688",
    status: "Active Member / VIP Client"
  });
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedMessage("Profil berhasil diperbarui!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neon-purple/10 to-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-blue to-neon-purple p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-white dark:bg-[#111] flex items-center justify-center text-3xl font-bold font-display text-neon-purple">
              {profile.name.charAt(0)}
            </div>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {profile.status}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1">{profile.name}</h1>
            <p className="text-gray-500 text-sm mb-3">{profile.email} • {profile.phone}</p>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold transition-all inline-flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "Batal Edit" : "Edit Profil"}
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="mt-4 p-3 rounded-xl bg-green-500/10 text-green-500 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {savedMessage}
          </div>
        )}

        {isEditing && (
          <form onSubmit={handleSave} className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Edit Informasi Profil</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-neon-purple"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-neon-purple"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nomor Telepon</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-neon-purple"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-neon-purple text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Simpan Perubahan
            </button>
          </form>
        )}
      </div>

      {/* Account Quick Links & Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/my-orders" className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-neon-purple transition-all group flex items-center justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1">Status Pesanan & Histori</h3>
            <p className="text-xs text-gray-500">Lihat progres website dan transaksi</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/order" className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-neon-purple transition-all group flex items-center justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1">Pesan & Pembayaran</h3>
            <p className="text-xs text-gray-500">Buat pesanan baru atau bayar invoice</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/consult" className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-neon-purple transition-all group flex items-center justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-1">Konsultasi & Bantuan</h3>
            <p className="text-xs text-gray-500">Chat admin atau AI Assistant</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Detailed Menu List */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold font-display px-2">Pengaturan & Informasi Akun</h2>
        
        <div className="space-y-2">
          {/* Theme switcher row */}
          <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                🌓
              </div>
              <div>
                <p className="font-medium text-sm">Tema Tampilan (Light / Dark / System)</p>
                <p className="text-xs text-gray-500">Sesuaikan kenyamanan mata Anda</p>
              </div>
            </div>
            <ThemeSwitch />
          </div>

          <Link to="/my-orders" className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Invoice & Histori Pembayaran</p>
                <p className="text-xs text-gray-500">Download kuitansi dan cek status</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link to="/support" className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Pusat Bantuan & Pengaduan (Support)</p>
                <p className="text-xs text-gray-500">Tiket kendala dan panduan teknis</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link to="/services" className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Tentang Kami (PixelForge Studio)</p>
                <p className="text-xs text-gray-500">Profil agensi, portofolio, dan visi misi</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Legal & Kebijakan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Syarat & Ketentuan PixelForge Studio: Semua pesanan website dikerjakan sesuai briefing dan paket yang dipilih."); }} className="p-2 rounded-lg hover:bg-white dark:hover:bg-black/20 text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <span>Syarat & Ketentuan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Kebijakan Privasi: Kami menjaga kerahasiaan data klien dan tidak pernah membagikannya ke pihak ketiga."); }} className="p-2 rounded-lg hover:bg-white dark:hover:bg-black/20 text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <span>Kebijakan Privasi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
                  navigate("/");
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Keluar (Logout)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
