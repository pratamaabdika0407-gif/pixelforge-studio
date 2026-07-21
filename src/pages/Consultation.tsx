import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Consultation() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    country: '',
    language: 'Indonesia',
    business: '',
    webType: 'Landing Page',
    topic: '',
    desc: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-24 px-4 max-w-2xl mx-auto text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
        </motion.div>
        <h2 className="text-3xl font-bold font-display mb-4">{t('consult.success')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('consult.successMsg')}</p>
        <button onClick={() => setIsSuccess(false)} className="px-8 py-3 bg-neon-purple text-white rounded-full font-medium">Buat Baru</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 px-4 max-w-3xl mx-auto"
    >
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-accent-blue/10 text-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">{t('consult.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{t('consult.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('consult.name')}</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('consult.email')}</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('consult.whatsapp')}</label>
            <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('consult.business')}</label>
            <input required type="text" value={formData.business} onChange={e => setFormData({...formData, business: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('consult.country')}</label>
            <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('consult.language')}</label>
            <input required type="text" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('consult.webType')}</label>
          <select value={formData.webType} onChange={e => setFormData({...formData, webType: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none">
            <option>Landing Page</option>
            <option>Company Profile</option>
            <option>E-Commerce / UMKM</option>
            <option>Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('consult.topic')}</label>
          <input required type="text" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('consult.desc')}</label>
          <textarea required rows={4} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-accent-blue outline-none"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-accent-blue text-white font-bold hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? t('consult.submitting') : t('consult.submit')}
        </button>
      </form>
    </motion.div>
  );
}
