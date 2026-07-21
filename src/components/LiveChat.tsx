import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Paperclip, Image as ImageIcon, CheckCircle, Clock, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LiveChat() {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem('chat_session_id');
    if (!sid) {
      sid = 'ses_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chat_session_id', sid);
    }
    setSessionId(sid);
    
    // Poll for messages
    const fetchChat = async () => {
      if (!sid) return;
      try {
        const res = await fetch(`/api/chat/${sid}`);
        const data = await res.json();
        if (data && data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg.text, isAdmin: false, lang })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev.filter(m => m.id !== userMsg.id), userMsg, data.message]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-neon-purple text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 w-[350px] max-h-[500px] h-[calc(100vh-120px)] bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-neon-purple to-accent-blue text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold">PixelForge Support</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  {t('chat.online')}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/50">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-gray-500 mt-10">
                  <p>{t('chat.greeting')}</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user' ? 'bg-neon-purple text-white rounded-br-none' : 'bg-gray-200 dark:bg-white/10 rounded-bl-none text-gray-900 dark:text-white'}`}>
                      {msg.text}
                      <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/70 text-right' : 'text-gray-500 dark:text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {msg.showContact && (
                      <div className="flex flex-col gap-2 mt-2 w-full max-w-[80%] pl-2">
                        <button
                          onClick={() => window.open(`https://wa.me/6283894781688?text=${encodeURIComponent(lang === 'en' ? "Hello PixelForge Studio,\n\nI'm interested in your website development services.\n\nCould you provide information about your services, pricing, and estimated completion time?\n\nThank you." : "Halo PixelForge Studio,\n\nSaya tertarik menggunakan jasa pembuatan website.\n\nMohon informasi mengenai layanan, harga, dan estimasi pengerjaan.\n\nTerima kasih.")}`, '_blank')}
                          className="text-xs font-medium bg-green-500 text-white py-2 px-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {t('contact.liveChatFallbackWa')}
                        </button>
                        <button
                          onClick={() => window.open(`mailto:muhammadabdikapratama7@gmail.com?subject=${encodeURIComponent("Website Development Inquiry")}&body=${encodeURIComponent("Hello PixelForge Studio,\n\nI'm interested in ordering a website.\n\nPlease contact me regarding pricing and project details.\n\nThank you.")}`)}
                          className="text-xs font-medium bg-blue-500 text-white py-2 px-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {t('contact.liveChatFallbackEmail')}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-white/10">
              <form onSubmit={sendMessage} className="flex items-center gap-2 relative">
                <button type="button" className="p-2 text-gray-400 hover:text-neon-purple transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')} 
                  className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-purple"
                />
                <button type="submit" disabled={!input.trim() || loading} className="p-2 bg-neon-purple text-white rounded-full hover:bg-neon-purple/90 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
