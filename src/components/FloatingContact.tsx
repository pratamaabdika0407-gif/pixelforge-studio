import React, { useState } from 'react';
import { MessageCircle, Mail, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang } = useLanguage();

  const handleWhatsApp = () => {
    const msg = lang === 'en' 
      ? "Hello PixelForge Studio,\n\nI'm interested in your website development services.\n\nCould you provide information about your services, pricing, and estimated completion time?\n\nThank you."
      : "Halo PixelForge Studio,\n\nSaya tertarik menggunakan jasa pembuatan website.\n\nMohon informasi mengenai layanan, harga, dan estimasi pengerjaan.\n\nTerima kasih.";
    window.open(`https://wa.me/6283894781688?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = "Website Development Inquiry";
    const body = "Hello PixelForge Studio,\n\nI'm interested in ordering a website.\n\nPlease contact me regarding pricing and project details.\n\nThank you.";
    window.open(`mailto:muhammadabdikapratama7@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 items-end"
          >
            <button
              onClick={handleEmail}
              className="flex items-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors font-medium whitespace-nowrap"
            >
              <span>{t('contact.sendEmail')}</span>
              <Mail className="w-5 h-5" />
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors font-medium whitespace-nowrap"
            >
              <span>{t('contact.chatWa')}</span>
              <MessageCircle className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-neon-purple text-white rounded-full shadow-[0_0_20px_rgba(192,38,211,0.5)] flex items-center justify-center hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Info className="w-6 h-6" />}
      </button>
    </div>
  );
}
