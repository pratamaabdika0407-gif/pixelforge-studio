import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun, Menu, X, ArrowRight, CheckCircle2, ChevronRight, Zap, MessageCircle, Mail } from "lucide-react";
import { clsx } from "clsx";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Pricing from "./pages/Pricing";
import Order from "./pages/Order";
import AdminLogin from "./pages/AdminLogin";
import AdminSetup from "./pages/AdminSetup";
import AdminDashboard from "./pages/AdminDashboard";
import MyOrders from "./pages/MyOrders";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import FreeQuote from "./pages/FreeQuote";
import Consultation from "./pages/Consultation";
import { CurrencyProvider, useCurrency } from "./context/CurrencyContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import LiveChat from "./components/LiveChat";
import FloatingContact from "./components/FloatingContact";
import Notifications from "./components/Notifications";

import SEO from "./components/SEO";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children, toggleTheme, isDark }: { children: React.ReactNode, toggleTheme: () => void, isDark: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currency, setCurrency, usdEnabled, idrEnabled } = useCurrency();
  const { lang, setLang, t } = useLanguage();
  
  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <SEO />
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-[#050505]/70 border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-neon-purple flex items-center justify-center text-white font-bold text-xl font-display">P</div>
            <span className="text-xl font-bold font-display tracking-tight">PixelForge</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-neon-purple transition-colors">{t('nav.home')}</Link>
            <Link to="/services" className="text-sm font-medium hover:text-neon-purple transition-colors">{t('nav.services')}</Link>
            <Link to="/portfolio" className="text-sm font-medium hover:text-neon-purple transition-colors">{t('nav.portfolio')}</Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-neon-purple transition-colors">{t('nav.pricing')}</Link>
            
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-white/10">
              <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                <button 
                  onClick={() => setLang('id')} 
                  className={clsx("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", lang === 'id' ? "bg-white dark:bg-[#222] shadow-sm text-neon-purple" : "text-gray-500 hover:text-gray-900 dark:hover:text-white")}
                >
                  🇮🇩
                </button>
                <button 
                  onClick={() => setLang('en')} 
                  className={clsx("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", lang === 'en' ? "bg-white dark:bg-[#222] shadow-sm text-neon-purple" : "text-gray-500 hover:text-gray-900 dark:hover:text-white")}
                >
                  🇺🇸
                </button>
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1">
                {idrEnabled && (
                  <button 
                    onClick={() => setCurrency('IDR')} 
                    className={clsx("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", currency === 'IDR' ? "bg-white dark:bg-[#222] shadow-sm text-neon-purple" : "text-gray-500 hover:text-gray-900 dark:hover:text-white")}
                  >
                    IDR
                  </button>
                )}
                {usdEnabled && (
                  <button 
                    onClick={() => setCurrency('USD')} 
                    className={clsx("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", currency === 'USD' ? "bg-white dark:bg-[#222] shadow-sm text-neon-purple" : "text-gray-500 hover:text-gray-900 dark:hover:text-white")}
                  >
                    USD
                  </button>
                )}
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/order" className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:scale-105 transition-transform">
                {t('nav.orderNow')}
              </Link>
            </div>
          </nav>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#050505] overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">{t('nav.home')}</Link>
              <Link to="/services" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">{t('nav.services')}</Link>
              <Link to="/portfolio" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">{t('nav.portfolio')}</Link>
              <Link to="/pricing" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">{t('nav.pricing')}</Link>
              <Link to="/order" onClick={() => setIsOpen(false)} className="text-lg font-medium p-2 text-neon-purple hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">{t('nav.orderNow')}</Link>
              
              <div className="flex items-center gap-2 p-2">
                <button 
                  onClick={() => setLang('id')} 
                  className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors border", lang === 'id' ? "border-neon-purple text-neon-purple bg-neon-purple/5" : "border-gray-200 dark:border-white/10")}
                >
                  🇮🇩 ID
                </button>
                <button 
                  onClick={() => setLang('en')} 
                  className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors border", lang === 'en' ? "border-neon-purple text-neon-purple bg-neon-purple/5" : "border-gray-200 dark:border-white/10")}
                >
                  🇺🇸 EN
                </button>
              </div>
              
              <div className="flex items-center gap-2 p-2">
                {idrEnabled && (
                  <button 
                    onClick={() => setCurrency('IDR')} 
                    className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors border", currency === 'IDR' ? "border-neon-purple text-neon-purple bg-neon-purple/5" : "border-gray-200 dark:border-white/10")}
                  >
                    IDR
                  </button>
                )}
                {usdEnabled && (
                  <button 
                    onClick={() => setCurrency('USD')} 
                    className={clsx("flex-1 py-2 text-sm font-bold rounded-lg transition-colors border", currency === 'USD' ? "border-neon-purple text-neon-purple bg-neon-purple/5" : "border-gray-200 dark:border-white/10")}
                  >
                    USD
                  </button>
                )}
              </div>

              <button onClick={toggleTheme} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg text-left">
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {children}
      </main>

      <LiveChat />
      <FloatingContact />
      <Notifications />

      <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-neon-purple flex items-center justify-center text-white font-bold font-display">P</div>
              <span className="text-xl font-bold font-display tracking-tight">PixelForge</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              {t('hero.subtitle')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-6">Company</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/services" className="hover:text-neon-purple transition-colors">{t('nav.services')}</Link></li>
              <li><Link to="/portfolio" className="hover:text-neon-purple transition-colors">{t('nav.portfolio')}</Link></li>
              <li><Link to="/pricing" className="hover:text-neon-purple transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link to="/contact" className="hover:text-neon-purple transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/support" className="hover:text-neon-purple transition-colors">{t('nav.support')}</Link></li>
              <li><Link to="/my-orders" className="hover:text-neon-purple transition-colors">{t('nav.myOrders')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-6">Connect</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><button onClick={() => window.open(`https://wa.me/6283894781688?text=${encodeURIComponent(lang === 'en' ? "Hello PixelForge Studio,\n\nI'm interested in your website development services.\n\nCould you provide information about your services, pricing, and estimated completion time?\n\nThank you." : "Halo PixelForge Studio,\n\nSaya tertarik menggunakan jasa pembuatan website.\n\nMohon informasi mengenai layanan, harga, dan estimasi pengerjaan.\n\nTerima kasih.")}`, '_blank')} className="hover:text-neon-purple transition-colors flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp</button></li>
              <li><button onClick={() => window.open(`mailto:muhammadabdikapratama7@gmail.com?subject=${encodeURIComponent("Website Development Inquiry")}&body=${encodeURIComponent("Hello PixelForge Studio,\n\nI'm interested in ordering a website.\n\nPlease contact me regarding pricing and project details.\n\nThank you.")}`)} className="hover:text-neon-purple transition-colors flex items-center gap-2"><Mail className="w-4 h-4" /> Email</button></li>
              <li><Link to="/admin" className="hover:text-neon-purple transition-colors mt-4 inline-block">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-200 dark:border-white/10 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PixelForge Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true); // Default to Dark Mode

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <CurrencyProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout toggleTheme={toggleTheme} isDark={isDark}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/order" element={<Order />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/setup" element={<AdminSetup />} />
                <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/support" element={<Support />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/quote" element={<FreeQuote />} />
                <Route path="/consult" element={<Consultation />} />
                {/* Fallback routes for requested pages that point to home for now to prevent 404s */}
                <Route path="/blog" element={<Home />} />
                <Route path="/faq" element={<Home />} />
                <Route path="/testimonials" element={<Home />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </BrowserRouter>
      </LanguageProvider>
    </CurrencyProvider>
  );
}
