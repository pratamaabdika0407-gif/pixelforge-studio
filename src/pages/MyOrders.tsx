import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Clock, XCircle, FileText, Download, ChevronRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { clsx } from 'clsx';

export default function MyOrders() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { formatPrice, currency } = useCurrency();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      handleSearch(emailParam);
    }
  }, [searchParams]);

  const handleSearch = async (searchEmail = email) => {
    if (!searchEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/my-orders?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();
      setOrders(data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pembayaran Berhasil':
      case 'Selesai': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'Ditolak':
      case 'Dibatalkan': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      case 'Menunggu Pembayaran':
      case 'Menunggu Verifikasi': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selesai': return <CheckCircle className="w-5 h-5" />;
      case 'Ditolak':
      case 'Dibatalkan': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight mb-6">Status Pesanan Saya</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Masukkan alamat email yang Anda gunakan saat memesan untuk melihat status pesanan Anda.</p>
      </div>

      <div className="max-w-xl mx-auto mb-12 relative">
        <input 
          type="email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Masukkan email Anda..." 
          className="w-full px-6 py-4 rounded-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-neon-purple shadow-sm text-lg pr-32"
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={() => handleSearch()}
          disabled={loading || !email}
          className="absolute right-2 top-2 bottom-2 px-6 bg-neon-purple text-white font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Mencari...' : 'Cari'}
        </button>
      </div>

      {hasSearched && !loading && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Tidak ada pesanan ditemukan</h3>
              <p className="text-gray-500">Kami tidak dapat menemukan pesanan dengan email tersebut.</p>
            </div>
          ) : (
            orders.map(order => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-white/10 flex flex-wrap justify-between items-center gap-4 bg-gray-50 dark:bg-black/50">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nomor Pesanan</p>
                    <p className="font-bold font-display text-lg">{order.orderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                    <p className="font-medium">{new Date(order.date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Harga</p>
                    <p className="font-bold text-neon-purple">
                      {order.currency === 'USD' ? '$' : 'Rp '} 
                      {((order as any)?.total || 0).toLocaleString(order?.currency === 'USD' ? 'en-US' : 'id-ID')}
                    </p>
                  </div>
                  <div>
                    <span className={clsx("px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2", getStatusColor(order.status))}>
                      {getStatusIcon(order.status)} {t(`orderStatus.${order.status}`)}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {/* Timeline Progress */}
                  <div className="relative mb-12">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-white/10 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-neon-purple -translate-y-1/2 transition-all duration-1000" style={{ width: `${order.progress || (order.status === 'Selesai' ? 100 : order.status === 'Diproses' ? 50 : 10)}%` }}></div>
                    
                    <div className="relative flex justify-between z-10 hidden sm:flex">
                      {['Analisis Kebutuhan', 'Desain UI/UX', 'Pengembangan', 'Revisi', 'QA', 'Deployment', 'Selesai'].map((step, i) => (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2", 
                            (order.progress !== undefined ? (order.progress >= (i * (100/6))) : (order.status === 'Selesai')) ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/30" : 
                            "bg-gray-200 dark:bg-gray-800 text-gray-500"
                          )}>
                            {i + 1}
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium text-gray-500 text-center px-1">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {order.progress !== undefined && (
                    <div className="mb-8 text-center">
                      <span className="inline-block px-4 py-1 rounded-full bg-neon-purple/10 text-neon-purple font-bold text-sm">
                        Progress Pengerjaan: {order.progress}%
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold mb-4">Informasi Layanan</h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li><span className="font-medium text-gray-900 dark:text-white">Layanan ID:</span> {order.serviceId}</li>
                        <li><span className="font-medium text-gray-900 dark:text-white">Paket ID:</span> {order.planId}</li>
                        <li><span className="font-medium text-gray-900 dark:text-white">Email:</span> {order.email}</li>
                      </ul>
                    </div>
                    
                    {order.notes && (
                      <div>
                        <h4 className="font-bold mb-4">Catatan Admin</h4>
                        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 text-sm text-yellow-800 dark:text-yellow-500">
                          {order.notes}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 flex justify-end">
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-medium transition-colors">
                      <Download className="w-4 h-4" /> Download Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
