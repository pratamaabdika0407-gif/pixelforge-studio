import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRight, CheckCircle, Upload } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function FreeQuote() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    whatsapp: '',
    country: '',
    language: 'Indonesia',
    webType: 'Landing Page',
    package: 'Professional',
    pages: '1',
    domain: 'Ya',
    hosting: 'Ya',
    features: '',
    deadline: '',
    budget: '',
    desc: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.quote.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 px-4 max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-neon-purple/10 text-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Calculator className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-4">{t('quote.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{t('quote.subtitle')}</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-8"
          >
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">1. Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.name')}</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.company')}</label>
                    <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.email')}</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.whatsapp')}</label>
                    <input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.country')}</label>
                    <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.language')}</label>
                    <input required type="text" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Project Details */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">2. Project Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.webType')}</label>
                    <select value={formData.webType} onChange={e => setFormData({...formData, webType: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none">
                      <option>Landing Page</option>
                      <option>Company Profile</option>
                      <option>E-Commerce / UMKM</option>
                      <option>Blog / News</option>
                      <option>Custom Web App</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.pages')}</label>
                    <input type="number" min="1" value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.domain')}</label>
                    <select value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none">
                      <option>Ya</option>
                      <option>Tidak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.hosting')}</label>
                    <select value={formData.hosting} onChange={e => setFormData({...formData, hosting: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none">
                      <option>Ya</option>
                      <option>Tidak</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Additional & Submit */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">3. Additional Information</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('quote.features')}</label>
                  <input type="text" placeholder="e.g. Live Chat, Payment Gateway" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.deadline')}</label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quote.budget')}</label>
                    <input type="text" placeholder="IDR / USD" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('quote.desc')}</label>
                  <textarea rows={4} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('quote.upload')}</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-neon-purple transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm">Click or drag file here</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between mt-8 pt-8 border-t border-gray-200 dark:border-white/10">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="px-6 py-2 rounded-full font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Back
                </button>
              ) : <div></div>}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full bg-neon-purple text-white font-medium hover:bg-neon-purple/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {step === 3 ? (isSubmitting ? t('quote.submitting') : t('quote.submit')) : 'Next'} {step < 3 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111111] border border-neon-purple rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(192,38,211,0.15)]"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold font-display mb-8">{t('quote.resultTitle')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="p-6 bg-gray-50 dark:bg-black rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 mb-1">{t('quote.priceIdr')}</p>
                <p className="text-3xl font-bold text-neon-purple">Rp {((result as any)?.priceIdr || 0).toLocaleString('id-ID')}</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-black rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 mb-1">{t('quote.priceUsd')}</p>
                <p className="text-3xl font-bold text-green-500">${((result as any)?.priceUsd || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-black rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 mb-1">{t('quote.time')}</p>
                <p className="text-xl font-bold">{result.eta}</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-black rounded-2xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 mb-1">{t('quote.recommended')}</p>
                <p className="text-xl font-bold">{result.recommended}</p>
              </div>
            </div>

            <Link to="/order" className="inline-flex px-8 py-4 rounded-full bg-neon-purple text-white font-medium hover:opacity-90 transition-opacity">
              {t('quote.continue')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
