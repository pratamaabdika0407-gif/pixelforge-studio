import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageCircle, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t, lang } = useLanguage();

  const handleWhatsApp = () => {
    const waMsg = lang === 'en' 
      ? "Hello PixelForge Studio,\n\nI'm interested in your website development services.\n\nCould you provide information about your services, pricing, and estimated completion time?\n\nThank you."
      : "Halo PixelForge Studio,\n\nSaya tertarik menggunakan jasa pembuatan website.\n\nMohon informasi mengenai layanan, harga, dan estimasi pengerjaan.\n\nTerima kasih.";
    window.open(`https://wa.me/6283894781688?text=${encodeURIComponent(waMsg)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = "Website Development Inquiry";
    const body = "Hello PixelForge Studio,\n\nI'm interested in ordering a website.\n\nPlease contact me regarding pricing and project details.\n\nThank you.";
    window.open(`mailto:muhammadabdikapratama7@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-4 py-24"
    >
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold font-display tracking-tight mb-6">{t('contact.title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{t('contact.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <button 
          onClick={handleWhatsApp}
          className="p-8 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-4 hover:border-green-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all group text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">WhatsApp</h2>
          <p className="text-gray-500 font-medium">083894781688</p>
        </button>

        <button 
          onClick={handleEmail}
          className="p-8 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-4 hover:border-neon-purple hover:shadow-[0_0_30px_rgba(192,38,211,0.15)] transition-all group text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-neon-purple/5 dark:bg-neon-purple/10 flex items-center justify-center text-neon-purple group-hover:scale-110 transition-transform">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Email</h2>
          <p className="text-gray-500 font-medium">muhammadabdikapratama7@gmail.com</p>
        </button>

        <div className="p-8 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">{t('contact.hours')}</h2>
          <div className="text-gray-500 font-medium space-y-1">
            <p>{t('contact.hours1')}</p>
            <p>{t('contact.hours2')}</p>
            <p>{t('contact.hours3')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
