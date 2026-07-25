import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setNotifications(data.filter(n => !n.read));
        }
      } catch (err) {
        // ignore
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await fetch('/api/notifications/read', { method: 'POST' });
  };

  return (
    <div className="fixed top-24 right-6 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 3).map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-lg rounded-2xl p-4 flex gap-4 pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{notif.title}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
            </div>
            <button onClick={() => markAsRead(notif.id)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors self-start p-1 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
