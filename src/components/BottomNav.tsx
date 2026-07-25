import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, ShoppingCart, Clock, MessageSquare, User, Sparkles, PhoneCall, X } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";

export default function BottomNav() {
  const location = useLocation();
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [historyCount, setHistoryCount] = useState(1);

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "Portofolio", path: "/portfolio", icon: Briefcase },
    { name: "Pesan", path: "/order", icon: ShoppingCart },
    { name: "Histori", path: "/my-orders", icon: Clock, badge: historyCount },
    { name: "Konsultasi", path: "/consult", icon: MessageSquare, badge: unreadCount },
    { name: "Akun", path: "/account", icon: User },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-28 right-6 z-[110] flex flex-col items-end gap-3">
        <AnimatePresence>
          {showFabMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 w-56 mb-2"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/10 px-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions</span>
                <button onClick={() => setShowFabMenu(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Link
                to="/consult"
                onClick={() => setShowFabMenu(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>Chat Admin WhatsApp</span>
              </Link>
              <Link
                to="/consult"
                onClick={() => setShowFabMenu(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-neon-purple/10 text-neon-purple flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>AI Assistant Web</span>
              </Link>
              <a
                href="tel:+6283894781688"
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm font-medium"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span>Telepon Langsung</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFabMenu(!showFabMenu)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-purple to-accent-blue text-white shadow-xl flex items-center justify-center relative group animate-bounce"
          title="Bantuan & Chat"
        >
          <Sparkles className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
            2
          </span>
        </motion.button>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-[100] bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] py-2.5 px-3 sm:px-6 transition-all pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center py-1.5 px-2 sm:px-4 rounded-2xl transition-all relative group",
                  isActive
                    ? "text-neon-purple scale-105"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                )}
              >
                <div className={clsx(
                  "p-1.5 rounded-xl transition-all relative",
                  isActive ? "bg-neon-purple/10 shadow-sm" : "group-hover:bg-gray-100 dark:group-hover:bg-white/5"
                )}>
                  <Icon className={clsx("w-5 h-5", isActive ? "text-neon-purple" : "text-gray-400 dark:text-gray-400")} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={clsx(
                  "text-[11px] font-medium mt-0.5 tracking-tight",
                  isActive ? "text-neon-purple font-bold" : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
