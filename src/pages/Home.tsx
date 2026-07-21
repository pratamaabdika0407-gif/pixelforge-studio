import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Star, Users, Zap, Layout, Smartphone, Search, MessageCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
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
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-purple/20 via-black/0 to-black/0 dark:from-neon-purple/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-8"
          >
            {t('hero.title1')} <br className="hidden md:block"/> {t('hero.title2')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto"
          >
            <Link to="/order" className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium hover:scale-105 transition-transform shadow-[0_0_20px_rgba(192,38,211,0.3)]">
              {t('nav.orderNow')}
            </Link>
            <Link to="/quote" className="px-6 py-3 rounded-full bg-neon-purple text-white font-medium hover:scale-105 transition-transform shadow-[0_0_20px_rgba(192,38,211,0.3)]">
              {t('nav.quote')}
            </Link>
            <Link to="/consult" className="px-6 py-3 rounded-full bg-accent-blue text-white font-medium hover:scale-105 transition-transform shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              {t('nav.consult')}
            </Link>
            <button onClick={handleWhatsApp} className="px-6 py-3 rounded-full bg-green-500 text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <MessageCircle className="w-4 h-4" /> {t('contact.chatWa')}
            </button>
            <button onClick={handleEmail} className="px-6 py-3 rounded-full bg-blue-500 text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Mail className="w-4 h-4" /> {t('contact.sendEmail')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: t('hero.stats.projects'), value: "200+" },
            { label: t('hero.stats.clients'), value: "150+" },
            { label: t('hero.stats.exp'), value: "5+" },
            { label: t('hero.stats.team'), value: "12" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-4xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-accent-blue to-neon-purple">{stat.value}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">{t('hero.features.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('hero.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: t('hero.features.fast'), desc: t('hero.features.fastDesc') },
              { icon: Smartphone, title: t('hero.features.resp'), desc: t('hero.features.respDesc') },
              { icon: Search, title: t('hero.features.seo'), desc: t('hero.features.seoDesc') }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-white/5 hover:border-accent-blue/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-neon-purple/10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold font-display mb-6">{t('hero.ctaReady')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">{t('hero.ctaReadyDesc')}</p>
          <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-blue to-neon-purple text-white font-medium hover:opacity-90 transition-opacity">
            {t('hero.ctaReadyBtn')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
