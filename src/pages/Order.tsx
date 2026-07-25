import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, Link } from "react-router-dom";
import { Upload, CheckCircle, Copy, Download, Maximize2, X, Image as ImageIcon } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { clsx } from "clsx";

export default function Order() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { currency, formatPrice, exchangeRate, autoCalculateUsd } = useCurrency();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceId: searchParams.get("service") || "",
    planId: searchParams.get("plan") || "",
    requirements: "",
    paymentMethod: "QRIS"
  });
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);
  
  // Payment step state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofError, setProofError] = useState("");
  const [showEnlargedQris, setShowEnlargedQris] = useState(false);
  const [countdown, setCountdown] = useState(24 * 60 * 60); // 24 hours
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then(r => r.json()),
      fetch("/api/pricing").then(r => r.json()),
      fetch("/api/settings").then(r => r.json())
    ]).then(([s, p, st]) => {
      setServices(s);
      setPricing(p);
      setSettings(st);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotalIdr = () => {
    const sPrice = services.find(s => s.id.toString() === formData.serviceId)?.price_idr || 0;
    const pPrice = pricing.find(p => p.id.toString() === formData.planId)?.price_idr || 0;
    return sPrice + pPrice;
  };

  const calculateTotalUsd = () => {
    const s = services.find(srv => srv.id.toString() === formData.serviceId);
    const p = pricing.find(pln => pln.id.toString() === formData.planId);
    const sPrice = autoCalculateUsd ? ((s?.price_idr || 0) / exchangeRate) : (s?.price_usd || ((s?.price_idr || 0) / exchangeRate));
    const pPrice = autoCalculateUsd ? ((p?.price_idr || 0) / exchangeRate) : (p?.price_usd || ((p?.price_idr || 0) / exchangeRate));
    return sPrice + pPrice;
  };

  const handleCreateOrder = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const totalIdr = calculateTotalIdr();
      const totalUsd = calculateTotalUsd();
      const endpoint = formData.paymentMethod === "PayPal" ? "/api/paypal/create-order" : "/api/orders";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          priceIdr: totalIdr,
          priceUsd: totalUsd,
          total: totalIdr, 
          currency: formData.paymentMethod === "PayPal" ? "USD" : currency 
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProofError("Please upload an image file (JPG, PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProofError("File size exceeds 5MB limit.");
      return;
    }

    setProofError("");
    setProofFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: any) => {
    e.preventDefault();
    if (!proofPreview || !order) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: proofPreview })
      });
      const data = await res.json();
      if (data.success) {
        setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  if (loading) return <div className="py-32 flex justify-center"><div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto px-4 py-20"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-display mb-4">Place Your Order</h1>
        <p className="text-gray-600 dark:text-gray-400">Let's start building your dream website today.</p>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-white/5 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neon-purple -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${step >= num ? 'bg-neon-purple text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              {step > num ? <CheckCircle className="w-5 h-5" /> : num}
            </div>
          ))}
        </div>

        {step === 1 && (
          <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleCreateOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" placeholder="john@example.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Number</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" placeholder="+62 812..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Type</label>
                <select required name="serviceId" value={formData.serviceId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all appearance-none">
                  <option value="">Select Service</option>
                  {services.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pricing Plan</label>
                <select required name="planId" value={formData.planId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all appearance-none">
                  <option value="">Select Plan</option>
                  {pricing.map((p: any) => <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price_idr, p.price_usd)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Requirements & Reference URLs</label>
              <textarea required name="requirements" value={formData.requirements} onChange={handleChange} rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all" placeholder="Describe your website needs..."></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "QRIS" })}
                  className={clsx(
                    "p-4 rounded-xl border flex items-center justify-center gap-3 font-medium transition-all",
                    formData.paymentMethod === "QRIS"
                      ? "border-neon-purple bg-neon-purple/10 text-neon-purple"
                      : "border-gray-200 dark:border-white/10 hover:border-gray-400"
                  )}
                >
                  <span>📱</span> QRIS (IDR)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "PayPal" })}
                  className={clsx(
                    "p-4 rounded-xl border flex items-center justify-center gap-3 font-medium transition-all",
                    formData.paymentMethod === "PayPal"
                      ? "border-neon-purple bg-neon-purple/10 text-neon-purple"
                      : "border-gray-200 dark:border-white/10 hover:border-gray-400"
                  )}
                >
                  <span>🌐</span> PayPal (USD)
                </button>
              </div>
            </div>

            {formData.serviceId && formData.planId && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-xl font-bold font-display text-neon-purple">{formData.paymentMethod === "PayPal" ? `$${calculateTotalUsd().toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}` : (currency === 'USD' ? `$${calculateTotalUsd().toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}` : `Rp ${calculateTotalIdr().toLocaleString('id-ID')}`)}</span>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || !formData.serviceId || !formData.planId} className="w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:scale-[1.02] transition-transform disabled:opacity-50">
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </button>
          </motion.form>
        )}

        {step === 2 && (
          formData.paymentMethod === "PayPal" ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium text-sm mb-6">
                  Complete payment in {formatTime(countdown)}
                </div>
                
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#003087] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  P
                </div>
                
                <h2 className="text-3xl font-bold mb-2">${calculateTotalUsd().toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} USD</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Email Tujuan PayPal:</p>
                <div className="inline-block px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 font-mono text-sm font-bold text-neon-purple mb-6">
                  muhammadabdikapratama7@gmail.com
                </div>

                <div className="max-w-md mx-auto mb-8">
                  <a
                    href={`https://www.paypal.com/paypalme/muhammadabdikapratama7/${calculateTotalUsd().toFixed(2)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async () => {
                      try {
                        await fetch("/api/paypal/capture-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: order?.id, paypalOrderId: order?.paypalOrderId })
                        });
                      } catch {}
                    }}
                    className="w-full py-4 px-6 rounded-xl bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02]"
                  >
                    <span>Bayar dengan PayPal</span>
                  </a>
                  <p className="text-xs text-gray-500 mt-2">Tombol di atas otomatis membuka halaman pembayaran PayPal ke muhammadabdikapratama7@gmail.com</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                <h3 className="text-base font-bold mb-2 text-center">Atau Upload Bukti Pembayaran PayPal</h3>
                <p className="text-xs text-gray-500 text-center mb-4">Jika webhook PayPal belum dikonfigurasi, silakan upload bukti transfer.</p>
                
                <form onSubmit={handleSubmitPayment} className="max-w-md mx-auto space-y-4">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  {!proofPreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl p-6 text-center hover:border-neon-purple transition-colors cursor-pointer group"
                    >
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-neon-purple transition-colors" />
                      <p className="text-sm text-gray-500">Upload Bukti Transfer PayPal</p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-black/5">
                      <img src={proofPreview} alt="Proof Preview" className="w-full h-40 object-cover" />
                      <button type="button" onClick={() => { setProofFile(null); setProofPreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {proofError && <p className="text-red-500 text-sm">{proofError}</p>}
                  
                  <button type="submit" disabled={isSubmitting || !proofPreview} className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {isSubmitting ? "Processing..." : "Konfirmasi Pembayaran PayPal"}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmitPayment} className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium text-sm mb-6">
                Complete payment in {formatTime(countdown)}
              </div>
              {order?.currency === 'USD' ? (
                <>
                  <h2 className="text-xl font-medium text-gray-500 mb-1">Total in USD: ${calculateTotalUsd().toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</h2>
                  <p className="text-sm text-gray-500 mb-4">Exchange Rate: $1 = Rp {((exchangeRate as number) || 15500).toLocaleString('id-ID')}</p>
                  <h2 className="text-3xl font-bold mb-2">To Pay: Rp {((order as any)?.total || 0).toLocaleString('id-ID')}</h2>
                </>
              ) : (
                <h2 className="text-3xl font-bold mb-2">Total: Rp {((order as any)?.total || 0).toLocaleString('id-ID')}</h2>
              )}
              <button 
                type="button" 
                onClick={() => copyToClipboard(order?.total?.toString() || "")}
                className="text-accent-blue hover:text-neon-purple text-sm font-medium flex items-center justify-center gap-1 mx-auto mb-8 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy Amount
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 relative max-w-sm mx-auto">
              <img src={settings.qrisUrl} alt="QRIS Payment" className="w-full h-auto object-contain rounded-xl bg-white p-2" />
              
              <div className="flex items-center justify-center gap-4 mt-6">
                <a href={settings.qrisUrl} download="PixelForge-QRIS.png" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" /> Download
                </a>
                <button type="button" onClick={() => setShowEnlargedQris(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  <Maximize2 className="w-4 h-4" /> Enlarge
                </button>
              </div>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <label className="text-sm font-medium block">Upload Proof of Payment (Max 5MB)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              
              {!proofPreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-2xl p-8 text-center hover:border-neon-purple transition-colors cursor-pointer group"
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400 group-hover:text-neon-purple transition-colors" />
                  <p className="text-sm text-gray-500">Click to browse or drag & drop</p>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-black/5">
                  <img src={proofPreview} alt="Proof Preview" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => { setProofFile(null); setProofPreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {proofError && <p className="text-red-500 text-sm">{proofError}</p>}
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={isSubmitting || !proofPreview} className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-blue to-neon-purple text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSubmitting ? "Processing..." : "Submit Payment"}
              </button>
            </div>
          </motion.form>
          )
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold font-display mb-4">Payment Under Verification</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Your order <span className="font-bold">{order?.orderNo}</span> is currently <span className="font-bold text-yellow-600 dark:text-yellow-400">{t('orderStatus.Menunggu Verifikasi')}</span>. We will check your payment and update the status soon.
            </p>
            <Link to={`/my-orders?email=${encodeURIComponent(formData.email)}`} className="inline-block px-8 py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium hover:scale-105 transition-transform">
              Track My Order
            </Link>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showEnlargedQris && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEnlargedQris(false)}
          >
            <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowEnlargedQris(false)} className="absolute -top-12 right-0 p-2 text-white hover:text-neon-purple transition-colors">
                <X className="w-8 h-8" />
              </button>
              <img src={settings.qrisUrl} alt="QRIS Enlarged" className="w-full h-auto rounded-2xl bg-white p-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

