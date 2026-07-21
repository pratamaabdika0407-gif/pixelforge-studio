import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Support() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    orderNo: '',
    category: '',
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
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

  const categories = ["Pembayaran", "Pesanan", "Website Error", "Login", "Revisi", "Refund", "Layanan", "Lainnya"];

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-2xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
        </motion.div>
        <h2 className="text-3xl font-bold font-display mb-4">{t('support.success')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('support.successMsg')}</p>
        <button onClick={() => setIsSuccess(false)} className="px-8 py-3 bg-neon-purple text-white rounded-full font-medium">{t('support.newReport')}</button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display tracking-tight mb-4">{t('support.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('support.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111111] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('support.name')}</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('support.email')}</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('support.whatsapp')}</label>
            <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('support.orderNo')}</label>
            <input type="text" value={formData.orderNo} onChange={e => setFormData({...formData, orderNo: e.target.value})} placeholder="ORD-XXXX-XXXX" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('support.category')}</label>
          <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all appearance-none">
            <option value="">{t('support.selectCategory')}</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('support.issueTitle')}</label>
          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('support.desc')}</label>
          <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('support.upload')}</label>
          <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-neon-purple hover:bg-neon-purple/5 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">{t('support.uploadHint')}</span>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-neon-purple text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
          {isSubmitting ? t('support.submitting') : t('support.submit')}
        </button>
      </form>
    </motion.div>
  );
}
