import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Briefcase, FileText, Settings, LogOut, Search, X, CheckCircle, XCircle, Download, MessageSquare, AlertCircle, CreditCard, DollarSign, Plus, Edit, Trash2, Tag, Bell, Mail, Send, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import ThemeSwitch from "../components/ThemeSwitch";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [search, setSearch] = useState("");
  const [paypalSearch, setPaypalSearch] = useState("");
  const [adminServices, setAdminServices] = useState<any[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    desc: "",
    priceIdr: 299000,
    priceUsd: 25,
    eta: "5-7 Hari Kerja",
    img: "",
    badge: "",
    features: "Responsive, Fast, SEO Basic"
  });
  const [paypalData, setPaypalData] = useState<{ stats: { totalPembayaran: number; totalBerhasil: number; totalPending: number; totalGagal: number; totalRefund: number }; orders: any[] }>({
    stats: { totalPembayaran: 0, totalBerhasil: 0, totalPending: 0, totalGagal: 0, totalRefund: 0 },
    orders: []
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [selectedConsult, setSelectedConsult] = useState<any>(null);
  const [chatInput, setChatInput] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", username: "", email: "", password: "", role: "STAFF" });
  
  // Settings Form
  const [qrisUrl, setQrisUrl] = useState("");
  const [exchangeRate, setExchangeRate] = useState(15500);
  const [autoCalculateUsd, setAutoCalculateUsd] = useState(true);
  const [usdEnabled, setUsdEnabled] = useState(true);
  const [idrEnabled, setIdrEnabled] = useState(true);

  const fetchAdminServices = () => {
    fetch("/api/admin/services").then(r => r.json()).then(setAdminServices);
  };

  const fetchData = () => {
    fetch("/api/admin/orders").then(r => r.json()).then(data => setOrders(Array.isArray(data) ? data : [])).catch(() => setOrders([]));
    fetch("/api/admin/tickets").then(r => r.json()).then(data => setTickets(Array.isArray(data) ? data : [])).catch(() => setTickets([]));
    fetch("/api/admin/chats").then(r => r.json()).then(data => setChats(Array.isArray(data) ? data : [])).catch(() => setChats([]));
    fetch("/api/admin/quotes").then(r => r.json()).then(data => setQuotes(Array.isArray(data) ? data : [])).catch(() => setQuotes([]));
    fetch("/api/admin/consultations").then(r => r.json()).then(data => setConsultations(Array.isArray(data) ? data : [])).catch(() => setConsultations([]));
    fetch("/api/admin/notification-logs").then(r => r.json()).then(data => setNotificationLogs(Array.isArray(data) ? data : [])).catch(() => setNotificationLogs([]));
    
    fetch("/api/admin/activity-logs")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setActivityLogs(data);
        else setActivityLogs([]);
      })
      .catch(() => setActivityLogs([]));

    fetch("/api/admin/staffs")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setStaffs(data);
        else setStaffs([]);
      })
      .catch(() => setStaffs([]));

    fetch("/api/admin/paypal-payments").then(r => r.json()).then(data => setPaypalData(data && typeof data === 'object' ? data : { stats: { totalPembayaran: 0, totalBerhasil: 0, totalPending: 0, totalGagal: 0, totalRefund: 0 }, orders: [] })).catch(() => {});
    fetchAdminServices();
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data && typeof data === 'object') {
        setSettings(data);
        setQrisUrl(data.qrisUrl || "");
        if (data.exchangeRate) setExchangeRate(data.exchangeRate);
        if (data.autoCalculateUsd !== undefined) setAutoCalculateUsd(data.autoCalculateUsd);
        if (data.usdEnabled !== undefined) setUsdEnabled(data.usdEnabled);
        if (data.idrEnabled !== undefined) setIdrEnabled(data.idrEnabled);
      }
    }).catch(() => {});
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/staffs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffForm)
    });
    const data = await res.json();
    if (data.success) {
      alert("Akun Staff/Operator berhasil dibuat!");
      setShowStaffModal(false);
      setStaffForm({ name: "", username: "", email: "", password: "", role: "STAFF" });
      fetchData();
    } else {
      alert(data.message || "Gagal membuat akun.");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;
    const res = await fetch(`/api/admin/staffs/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      alert("Akun berhasil dihapus.");
      fetchData();
    } else {
      alert(data.message || "Gagal menghapus akun.");
    }
  };

  const handleResendNotification = async (logId: string) => {
    const res = await fetch("/api/admin/notification-logs/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId })
    });
    const data = await res.json();
    if (data.success) {
      alert("Notifikasi berhasil dikirim ulang!");
      fetchData();
    } else {
      alert("Gagal mengirim ulang notifikasi.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin");
      return;
    }
    fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem("admin_token");
          navigate("/admin");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data || !data.success || !data.admin) {
          localStorage.removeItem("admin_token");
          navigate("/admin");
          return;
        }
        setAdminUser(data.admin);
        const role = data.admin.role || "SUPER_ADMIN";
        if (['User', 'Reseller', 'Affiliate', 'Guest'].includes(role)) {
          setAccessDenied(true);
        } else {
          setCheckingAuth(false);
          fetchData();
        }
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        navigate("/admin");
      });
  }, [navigate]);

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">⚠️</div>
          <h1 className="text-2xl font-bold font-display mb-2">Akses Ditolak</h1>
          <p className="text-sm text-gray-500 mb-6">Akun Anda terdeteksi bukan Administrator. Dashboard Admin hanya dapat diakses oleh akun dengan role Admin.</p>
          <button 
            onClick={() => {
              localStorage.removeItem("admin_token");
              navigate("/");
            }}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-xl hover:scale-[1.02] transition-transform"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  const handleUpdateStatus = async (id: number, status: string, notes: string = "", progress?: number) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes, progress })
    });
    setSelectedOrder(null);
    fetchData();
  };
  
  const handleUpdateTicketStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setSelectedTicket(null);
    fetchData();
  };

  const sendAdminChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChat) return;
    
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selectedChat.sessionId, message: chatInput, isAdmin: true })
    });
    setChatInput("");
    fetchData();
    // re-fetch chat directly
    const res = await fetch(`/api/chat/${selectedChat.sessionId}`);
    const data = await res.json();
    setSelectedChat(data);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrisUrl, exchangeRate, autoCalculateUsd, usdEnabled, idrEnabled })
    });
    fetchData();
    alert("Settings updated!");
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingService ? `/api/admin/services/${editingService.id}` : "/api/admin/services";
    const method = editingService ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceForm)
    });
    setShowServiceModal(false);
    setEditingService(null);
    fetchAdminServices();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Yakin ingin menghapus paket ini?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    fetchAdminServices();
  };

  const filteredOrders = orders.filter(o => 
    o.name?.toLowerCase().includes(search.toLowerCase()) || 
    o.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.orderNo?.toLowerCase().includes(search.toLowerCase())
  );

  const role = adminUser?.role || "SUPER_ADMIN";
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isStaff = role === 'STAFF';
  const isOperator = role === 'OPERATOR';

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'OPERATOR'] },
    { name: "Pesanan", path: "/admin/dashboard/orders", icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'OPERATOR'] },
    { name: "Manajemen Staff", path: "/admin/dashboard/staffs", icon: Briefcase, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: "Notifikasi Otomatis", path: "/admin/dashboard/notifications", icon: Bell, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { name: "Manajemen Harga", path: "/admin/dashboard/pricing", icon: DollarSign, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: "Pembayaran PayPal", path: "/admin/dashboard/paypal", icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { name: "Penawaran", path: "/admin/dashboard/quotes", icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { name: "Konsultasi", path: "/admin/dashboard/consultations", icon: Briefcase, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { name: "Pengaduan", path: "/admin/dashboard/tickets", icon: AlertCircle, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { name: "Live Chat", path: "/admin/dashboard/chat", icon: MessageSquare, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF'] },
    { name: "Log Aktivitas", path: "/admin/dashboard/activity-logs", icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'OPERATOR'] },
    { name: "Pengaturan", path: "/admin/dashboard/settings", icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
  ].filter(m => m.roles.includes(role));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/10 flex flex-col shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-white/10">
          <span className="text-xl font-bold font-display">PixelForge Admin</span>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
          {menu.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                location.pathname === item.path || (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path))
                  ? "bg-neon-purple/10 text-neon-purple" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 w-full transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <header className="h-20 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold font-display capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h1>
          <ThemeSwitch />
        </header>
        
        <main className="p-8 flex-1">
          <Routes>
            <Route path="/paypal" element={
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold font-display">Manajemen Pembayaran PayPal</h2>
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Cari nama, email, order No, tanggal..."
                      value={paypalSearch}
                      onChange={e => setPaypalSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-neon-purple"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Pembayaran</p>
                    <p className="text-3xl font-bold">{paypalData.stats.totalPembayaran}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Berhasil</p>
                    <p className="text-3xl font-bold text-green-500">{paypalData.stats.totalBerhasil}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Pending</p>
                    <p className="text-3xl font-bold text-yellow-500">{paypalData.stats.totalPending}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Gagal</p>
                    <p className="text-3xl font-bold text-red-500">{paypalData.stats.totalGagal}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Refund</p>
                    <p className="text-3xl font-bold text-purple-500">{paypalData.stats.totalRefund}</p>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-500">
                          <th className="p-4">Order No</th>
                          <th className="p-4">Klien & Email</th>
                          <th className="p-4">Layanan</th>
                          <th className="p-4">Nominal (USD)</th>
                          <th className="p-4">Status Pembayaran</th>
                          <th className="p-4">Tanggal</th>
                          <th className="p-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
                        {paypalData.orders
                          .filter((o: any) => {
                            const query = paypalSearch.toLowerCase();
                            const matchName = o.clientName?.toLowerCase().includes(query) || o.name?.toLowerCase().includes(query);
                            const matchEmail = o.email?.toLowerCase().includes(query);
                            const matchOrderNo = o.orderNo?.toLowerCase().includes(query);
                            const matchDate = new Date(o.createdAt || o.date).toLocaleDateString().toLowerCase().includes(query);
                            return !query || matchName || matchEmail || matchOrderNo || matchDate;
                          })
                          .map((order: any) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-4 font-mono font-medium">{order.orderNo}</td>
                              <td className="p-4">
                                <div className="font-medium">{order.clientName || order.name}</div>
                                <div className="text-xs text-gray-500">{order.email}</div>
                              </td>
                              <td className="p-4 font-medium">{order.serviceTitle}</td>
                              <td className="p-4 font-bold text-neon-purple">${order.priceUsd?.toFixed(2)}</td>
                              <td className="p-4">
                                <span className={clsx(
                                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                  order.paymentStatus === "Pembayaran Berhasil" || order.status === "Pembayaran Berhasil" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                  order.paymentStatus === "Pembayaran Gagal" || order.status === "Pembayaran Gagal" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                  order.paymentStatus === "Refund" || order.status === "Refund" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                )}>
                                  {order.paymentStatus || order.status || "Menunggu Pembayaran"}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-gray-500">
                                {new Date(order.createdAt || order.date).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={async () => {
                                      await fetch(`/api/admin/orders/${order.id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "Pembayaran Berhasil", paymentStatus: "Pembayaran Berhasil" })
                                      });
                                      fetchData();
                                    }}
                                    className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                    title="Setujui Pembayaran"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await fetch(`/api/admin/orders/${order.id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "Pembayaran Gagal", paymentStatus: "Pembayaran Gagal" })
                                      });
                                      fetchData();
                                    }}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    title="Tolak Pembayaran"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await fetch(`/api/admin/orders/${order.id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "Refund", paymentStatus: "Refund" })
                                      });
                                      fetchData();
                                    }}
                                    className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                                    title="Refund"
                                  >
                                    🔄
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />
            <Route path="/" element={
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Total Free Quote</p>
                    <p className="text-3xl font-bold">{quotes.length}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Total Konsultasi</p>
                    <p className="text-3xl font-bold text-blue-500">{consultations.length}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Konsultasi Hari Ini</p>
                    <p className="text-3xl font-bold text-accent-blue">
                      {consultations.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Free Quote Hari Ini</p>
                    <p className="text-3xl font-bold text-neon-purple">
                      {quotes.filter(q => new Date(q.date).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Estimasi Pendapatan (Quotes)</p>
                    <p className="text-3xl font-bold text-green-500">
                      Rp {quotes.reduce((sum, q) => sum + (q.result?.priceIdr || 0), 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Proyek Aktif (Diproses)</p>
                    <p className="text-3xl font-bold text-blue-500">{orders.filter(o => o.status === "Diproses" || o.status === "Sedang Dikerjakan").length}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Proyek Selesai</p>
                    <p className="text-3xl font-bold text-emerald-500">{orders.filter(o => o.status === "Selesai").length}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-sm font-medium mb-2">Konversi Quote (Estimasi)</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {quotes.length > 0 ? Math.round((orders.length / quotes.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </>
            } />
            
            <Route path="quotes" element={
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
                  <h2 className="font-semibold">Kelola Penawaran (Quotes)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-4">No Quote</th>
                        <th className="px-6 py-4">Nama Pelanggan</th>
                        <th className="px-6 py-4">Jenis Web</th>
                        <th className="px-6 py-4">Estimasi Harga</th>
                        <th className="px-6 py-4">Waktu Pengerjaan</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                      {quotes.map(q => (
                        <tr key={q.id}>
                          <td className="px-6 py-4 text-sm">{q.quoteNo}</td>
                          <td className="px-6 py-4 text-sm">{q.request?.name} <br/><span className="text-gray-500 text-xs">{q.request?.email}</span></td>
                          <td className="px-6 py-4 text-sm">{q.request?.webType}</td>
                          <td className="px-6 py-4 text-sm text-green-500 font-bold">Rp {((q?.result as any)?.priceIdr || 0).toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 text-sm">{q.result?.eta}</td>
                          <td className="px-6 py-4 text-sm">{q.status}</td>
                          <td className="px-6 py-4 text-sm text-right">
                            <button onClick={() => setSelectedQuote(q)} className="text-neon-purple hover:underline">Detail</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            <Route path="consultations" element={
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
                  <h2 className="font-semibold">Kelola Konsultasi</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-4">No Konsultasi</th>
                        <th className="px-6 py-4">Nama</th>
                        <th className="px-6 py-4">Topik</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                      {consultations.map(c => (
                        <tr key={c.id}>
                          <td className="px-6 py-4 text-sm">{c.consultationNo}</td>
                          <td className="px-6 py-4 text-sm">{c.name} <br/><span className="text-gray-500 text-xs">{c.whatsapp}</span></td>
                          <td className="px-6 py-4 text-sm">{c.topic}</td>
                          <td className="px-6 py-4 text-sm">
                            <select 
                              value={c.status}
                              onChange={(e) => {
                                fetch(`/api/admin/consultations/${c.id}`, {
                                  method: 'PUT',
                                  headers: {'Content-Type': 'application/json'},
                                  body: JSON.stringify({status: e.target.value})
                                }).then(fetchData);
                              }}
                              className="bg-transparent border border-gray-300 dark:border-white/20 rounded px-2 py-1 text-xs"
                            >
                              <option>Menunggu</option>
                              <option>Dijadwalkan</option>
                              <option>Selesai</option>
                              <option>Dibatalkan</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button className="text-blue-500 hover:underline text-xs" onClick={() => setSelectedConsult(c)}>Detail/Catatan</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            } />
            
            <Route path="orders" element={
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
                  <h2 className="font-semibold">Kelola Pesanan</h2>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Cari pesanan..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-sm focus:outline-none focus:border-neon-purple transition-colors"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-4">No Pesanan</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Pelanggan</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Tidak ada pesanan.</td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium">{order.orderNo}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-sm">{order.name}</p>
                              <p className="text-xs text-gray-500">{order.email}</p>
                            </td>
                            <td className="px-6 py-4 text-sm">Rp {((order as any)?.total || 0).toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4">
                              <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                order.status === "Menunggu Verifikasi" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
                                order.status === "Pembayaran Berhasil" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
                                order.status === "Ditolak" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
                                order.status === "Menunggu Pembayaran" && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                              )}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-sm font-medium text-neon-purple hover:underline"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            <Route path="tickets" element={
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
                  <h2 className="font-semibold">Kelola Pengaduan</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-4">No Tiket</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Pelapor</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                      {tickets.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada pengaduan.</td></tr>
                      ) : tickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td className="px-6 py-4 text-sm font-medium">{ticket.ticketNo}</td>
                          <td className="px-6 py-4 text-sm">{ticket.category}</td>
                          <td className="px-6 py-4 text-sm">{ticket.name}</td>
                          <td className="px-6 py-4 text-sm">{ticket.status}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedTicket(ticket)} className="text-sm font-medium text-neon-purple">Detail</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            <Route path="chat" element={
              <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="w-1/3 border-r border-gray-200 dark:border-white/10 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black">
                    <h3 className="font-bold">Sesi Chat Aktif</h3>
                  </div>
                  {chats.map(chat => (
                    <button key={chat.sessionId} onClick={() => setSelectedChat(chat)} className={clsx("w-full text-left p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors", selectedChat?.sessionId === chat.sessionId && "bg-neon-purple/5")}>
                      <div className="font-medium text-sm truncate">{chat.sessionId}</div>
                      <div className="text-xs text-gray-500 mt-1">{chat.messages.length} messages {chat.adminTakingOver ? "(Admin)" : "(AI)"}</div>
                    </button>
                  ))}
                </div>
                <div className="w-2/3 flex flex-col">
                  {selectedChat ? (
                    <>
                      <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{selectedChat.sessionId}</h3>
                          <span className="text-xs text-green-500">{selectedChat.adminTakingOver ? "Admin is handling" : "AI is handling"}</span>
                        </div>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {selectedChat.messages.map((m: any, i: number) => (
                          <div key={i} className={clsx("flex", m.sender === 'user' ? "justify-start" : "justify-end")}>
                            <div className={clsx("max-w-[70%] rounded-xl px-4 py-2 text-sm", m.sender === 'user' ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "bg-neon-purple text-white")}>
                              <div className="text-xs opacity-50 mb-1">{m.sender}</div>
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200 dark:border-white/10">
                        <form onSubmit={sendAdminChat} className="flex gap-2">
                          <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Balas sebagai admin..." className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:border-neon-purple outline-none" />
                          <button type="submit" className="px-4 py-2 bg-neon-purple text-white rounded-xl">Kirim</button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">Pilih sesi chat untuk melihat pesan.</div>
                  )}
                </div>
              </div>
            } />

            <Route path="pricing" element={
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold font-display">Manajemen Harga & Paket Website</h2>
                    <p className="text-sm text-gray-500">Kelola daftar layanan, harga IDR & USD, serta promo tanpa mengubah kode.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Cari paket website..."
                        value={serviceSearch}
                        onChange={e => setServiceSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-neon-purple"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setEditingService(null);
                        setServiceForm({ title: "", desc: "", priceIdr: 299000, priceUsd: 25, eta: "5-7 Hari Kerja", img: "", badge: "", features: "Responsive, Fast, SEO Basic" });
                        setShowServiceModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-neon-purple text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" /> Tambah Paket
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-500">
                          <th className="p-4">Paket / Layanan</th>
                          <th className="p-4">Harga IDR</th>
                          <th className="p-4">Harga USD</th>
                          <th className="p-4">Estimasi</th>
                          <th className="p-4">Badge</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
                        {adminServices
                          .filter(s => s.title?.toLowerCase().includes(serviceSearch.toLowerCase()) || s.desc?.toLowerCase().includes(serviceSearch.toLowerCase()))
                          .map(service => (
                            <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div className="font-bold flex items-center gap-2">
                                  {service.title}
                                  {service.badge && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neon-purple/10 text-neon-purple">{service.badge}</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">{service.desc}</div>
                              </td>
                              <td className="p-4 font-bold text-gray-900 dark:text-white">Rp {service.priceIdr?.toLocaleString('id-ID')}</td>
                              <td className="p-4 font-bold text-neon-purple">${service.priceUsd}</td>
                              <td className="p-4 text-gray-500 text-xs">{service.eta}</td>
                              <td className="p-4">
                                {service.badge ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                                    <Tag className="w-3 h-3" /> {service.badge}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Standard</span>
                                )}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button 
                                  onClick={() => {
                                    setEditingService(service);
                                    setServiceForm({
                                      title: service.title,
                                      desc: service.desc,
                                      priceIdr: service.priceIdr,
                                      priceUsd: service.priceUsd,
                                      eta: service.eta,
                                      img: service.img || "",
                                      badge: service.badge || "",
                                      features: Array.isArray(service.features) ? service.features.join(", ") : service.features || ""
                                    });
                                    setShowServiceModal(true);
                                  }}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-blue-500 transition-colors inline-flex"
                                  title="Edit Paket"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteService(service.id)}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-red-500 transition-colors inline-flex"
                                  title="Hapus Paket"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add/Edit Service Modal */}
                {showServiceModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowServiceModal(false)}>
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold font-display">{editingService ? "Edit Paket Website" : "Tambah Paket Website Baru"}</h3>
                        <button onClick={() => setShowServiceModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                      </div>

                      <form onSubmit={handleSaveService} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nama Layanan / Paket</label>
                          <input 
                            type="text" 
                            required
                            value={serviceForm.title}
                            onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                            placeholder="Contoh: Website Tour & Travel"
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
                          <textarea 
                            rows={2}
                            value={serviceForm.desc}
                            onChange={e => setServiceForm({ ...serviceForm, desc: e.target.value })}
                            placeholder="Deskripsi singkat fitur paket..."
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Harga (IDR - Rupiah)</label>
                            <input 
                              type="number" 
                              required
                              min="10000"
                              value={serviceForm.priceIdr}
                              onChange={e => {
                                const priceIdr = Number(e.target.value);
                                const priceUsd = autoCalculateUsd ? Math.round(priceIdr / exchangeRate) : serviceForm.priceUsd;
                                setServiceForm({ ...serviceForm, priceIdr, priceUsd });
                              }}
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Harga (USD - Dollar)</label>
                            <input 
                              type="number" 
                              required
                              min="1"
                              value={serviceForm.priceUsd}
                              onChange={e => setServiceForm({ ...serviceForm, priceUsd: Number(e.target.value) })}
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Estimasi Pengerjaan (ETA)</label>
                            <input 
                              type="text" 
                              value={serviceForm.eta}
                              onChange={e => setServiceForm({ ...serviceForm, eta: e.target.value })}
                              placeholder="7–10 Hari Kerja"
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Badge (Opsional)</label>
                            <select 
                              value={serviceForm.badge}
                              onChange={e => setServiceForm({ ...serviceForm, badge: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                            >
                              <option value="">Tanpa Badge</option>
                              <option value="Terlaris">Terlaris</option>
                              <option value="Populer">Populer</option>
                              <option value="Premium">Premium</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">URL Gambar / Thumbnail</label>
                          <input 
                            type="url" 
                            value={serviceForm.img}
                            onChange={e => setServiceForm({ ...serviceForm, img: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Fitur (pisahkan dengan koma)</label>
                          <input 
                            type="text" 
                            value={serviceForm.features}
                            onChange={e => setServiceForm({ ...serviceForm, features: e.target.value })}
                            placeholder="Responsive, CMS, SEO, WhatsApp"
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setShowServiceModal(false)}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                          >
                            Batal
                          </button>
                          <button 
                            type="submit"
                            className="px-5 py-2.5 bg-neon-purple text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            {editingService ? "Simpan Perubahan" : "Tambah Paket"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            } />

            <Route path="notifications" element={
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold font-display">Log Notifikasi Otomatis (Email & WhatsApp)</h2>
                    <p className="text-sm text-gray-500">Riwayat pengiriman otomatis pesan email dan WhatsApp ke pelanggan saat pesanan dibuat atau status berubah.</p>
                  </div>
                  <button 
                    onClick={() => fetchData()}
                    className="px-4 py-2 bg-neon-purple text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh Log
                  </button>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-500">
                          <th className="p-4">Waktu</th>
                          <th className="p-4">Tipe</th>
                          <th className="p-4">No. Pesanan</th>
                          <th className="p-4">Penerima</th>
                          <th className="p-4">Subjek / Pesan</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
                        {notificationLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                              {new Date(log.date).toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                log.type === 'email' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                              }`}>
                                {log.type === 'email' ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                {log.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-xs">{log.orderNo}</td>
                            <td className="p-4 font-medium">{log.recipient}</td>
                            <td className="p-4 max-w-xs truncate text-xs text-gray-500" title={log.message}>
                              <div className="font-bold text-gray-900 dark:text-white mb-0.5">{log.title}</div>
                              {log.message}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                Berhasil Terkirim
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleResendNotification(log.id)}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-neon-purple hover:text-white rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1"
                              >
                                <Send className="w-3.5 h-3.5" /> Kirim Ulang
                              </button>
                            </td>
                          </tr>
                        ))}
                        {notificationLogs.length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-400">Belum ada log notifikasi otomatis. Buat pesanan baru untuk menguji.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />

            <Route path="staffs" element={
              isSuperAdmin ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold font-display">Manajemen Staff & Operator</h2>
                      <p className="text-sm text-gray-500">Kelola akun Staff (manajemen pesanan & konsultasi) dan Operator (verifikasi pembayaran & pengerjaan).</p>
                    </div>
                    <button 
                      onClick={() => setShowStaffModal(true)}
                      className="px-4 py-2 bg-neon-purple text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Tambah Akun Baru
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="p-4">Nama</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role / Hak Akses</th>
                            <th className="p-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
                          {Array.isArray(staffs) && staffs.map(staff => (
                            <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium">{staff.name}</td>
                              <td className="p-4 font-mono text-xs">{staff.username}</td>
                              <td className="p-4 text-gray-500">{staff.email}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  staff.role === 'STAFF' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                                }`}>
                                  {staff.role}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleDeleteStaff(staff.id)}
                                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                  title="Hapus Akun"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(!Array.isArray(staffs) || staffs.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-gray-400">Belum ada akun Staff atau Operator tambahan.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {showStaffModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowStaffModal(false)}>
                      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold font-display">Tambah Akun Staff / Operator</h3>
                          <button onClick={() => setShowStaffModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                            <input 
                              type="text" 
                              required 
                              value={staffForm.name} 
                              onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} 
                              placeholder="Nama Petugas"
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input 
                              type="text" 
                              required 
                              value={staffForm.username} 
                              onChange={e => setStaffForm({ ...staffForm, username: e.target.value })} 
                              placeholder="staff123"
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input 
                              type="email" 
                              required 
                              value={staffForm.email} 
                              onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} 
                              placeholder="staff@pixelforge.id"
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input 
                              type="password" 
                              required 
                              value={staffForm.password} 
                              onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} 
                              placeholder="••••••••"
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Role / Hak Akses</label>
                            <select 
                              value={staffForm.role} 
                              onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} 
                              className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 outline-none focus:border-neon-purple text-sm"
                            >
                              <option value="STAFF">Staff (Pesanan, Chat, Konsultasi, Pengaduan)</option>
                              <option value="OPERATOR">Operator (Verifikasi Pembayaran & Pengerjaan)</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowStaffModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-neon-purple text-white rounded-xl text-sm font-medium hover:opacity-90">Simpan Akun</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl text-center max-w-lg mx-auto mt-12">
                  <div className="text-4xl mb-4">🚫</div>
                  <h2 className="text-xl font-bold font-display mb-2">Akses Ditolak</h2>
                  <p className="text-sm text-gray-500">Hanya Admin Utama yang dapat mengakses Manajemen Staff & Operator.</p>
                </div>
              )
            } />

            <Route path="activity-logs" element={
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold font-display">Log Aktivitas (Activity Log)</h2>
                    <p className="text-sm text-gray-500">Riwayat seluruh tindakan yang dilakukan oleh Admin, Staff, dan Operator pada sistem.</p>
                  </div>
                  <button onClick={() => fetchData()} className="px-4 py-2 bg-neon-purple text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" /> Refresh Log
                  </button>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-500">
                          <th className="p-4">Waktu</th>
                          <th className="p-4">Pengguna / Akun</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Tindakan (Action)</th>
                          <th className="p-4">Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
                        {Array.isArray(activityLogs) && activityLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                              {new Date(log.date).toLocaleString('id-ID')}
                            </td>
                            <td className="p-4 font-bold">{log.username}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10">
                                {log.role}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-neon-purple">{log.action}</td>
                            <td className="p-4 text-xs text-gray-500">{log.details}</td>
                          </tr>
                        ))}
                        {(!Array.isArray(activityLogs) || activityLogs.length === 0) && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-400">Belum ada log aktivitas tercatat.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />

            <Route path="settings" element={
              <div className="max-w-2xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-6">Pengaturan Sistem</h2>
                <form onSubmit={handleUpdateSettings} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">URL Gambar QRIS Utama</label>
                    <input 
                      type="url" 
                      value={qrisUrl}
                      onChange={e => setQrisUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:outline-none focus:border-neon-purple transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">Gambar ini akan ditampilkan di halaman pembayaran.</p>
                  </div>
                  {qrisUrl && (
                    <div className="p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black inline-block">
                      <img src={qrisUrl} alt="QRIS Preview" className="h-48 object-contain bg-white rounded-lg p-2" />
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200 dark:border-white/10">
                    <h3 className="font-bold mb-4">Pengaturan Mata Uang</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Kurs IDR ke USD</label>
                        <input 
                          type="number" 
                          value={exchangeRate}
                          onChange={e => setExchangeRate(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:outline-none focus:border-neon-purple transition-colors"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Nilai tukar manual jika API gagal (misal: 15500)</p>
                      </div>
                      
                      <div className="space-y-4 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={autoCalculateUsd}
                            onChange={e => setAutoCalculateUsd(e.target.checked)}
                            className="w-4 h-4 text-neon-purple rounded focus:ring-neon-purple bg-gray-100 border-gray-300"
                          />
                          <span className="text-sm font-medium">Hitung Harga USD Otomatis dari IDR</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={usdEnabled}
                            onChange={e => setUsdEnabled(e.target.checked)}
                            className="w-4 h-4 text-neon-purple rounded focus:ring-neon-purple bg-gray-100 border-gray-300"
                          />
                          <span className="text-sm font-medium">Aktifkan USD</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={idrEnabled}
                            onChange={e => setIdrEnabled(e.target.checked)}
                            className="w-4 h-4 text-neon-purple rounded focus:ring-neon-purple bg-gray-100 border-gray-300"
                          />
                          <span className="text-sm font-medium">Aktifkan IDR</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button type="submit" className="px-6 py-3 bg-neon-purple text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
                      Simpan Pengaturan
                    </button>
                  </div>
                </form>
              </div>
            } />
          </Routes>
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
              <h3 className="text-xl font-bold font-display">Detail Pesanan: {selectedOrder.orderNo}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Informasi Pelanggan</h4>
                  <div className="space-y-1">
                    <p><span className="font-medium">Nama:</span> {selectedOrder.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.email}</p>
                    <p><span className="font-medium">Telepon:</span> {selectedOrder.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Detail Layanan</h4>
                  <div className="space-y-1">
                    <p><span className="font-medium">Service ID:</span> {selectedOrder.serviceId}</p>
                    <p><span className="font-medium">Plan ID:</span> {selectedOrder.planId}</p>
                    <p><span className="font-medium">Total:</span> Rp {((selectedOrder as any)?.total || 0).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Kebutuhan</h4>
                  <p className="text-sm bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-white/10">{selectedOrder.requirements}</p>
                </div>
              </div>
              
              <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/10 pt-6 md:pt-0 md:pl-6">
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Bukti Pembayaran</h4>
                  {selectedOrder.proofUrl ? (
                    <div className="space-y-4">
                      <img src={selectedOrder.proofUrl} alt="Bukti Pembayaran" className="w-full h-auto max-h-64 object-contain rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black p-2" />
                      <a href={selectedOrder.proofUrl} download={`Proof-${selectedOrder.orderNo}.png`} className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" /> Unduh Bukti
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-center text-sm text-gray-500">
                      Belum ada bukti pembayaran yang diunggah.
                    </div>
                  )}
                </div>
                {selectedOrder.notes && (
                  <div>
                    <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Catatan Penolakan</h4>
                    <p className="text-sm bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
              <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black">
              <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-4">Ubah Status Pesanan</h4>
              <div className="flex gap-4 items-center">
                <select 
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 flex-1"
                  onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value, selectedOrder.notes, selectedOrder.progress)}
                  value={selectedOrder.status}
                >
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Pembayaran Berhasil">Pembayaran Berhasil</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                  <option value="Revisi">Revisi</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Progress:</span>
                  <input 
                    type="number" 
                    min="0" max="100" 
                    className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10"
                    value={selectedOrder.progress || 0}
                    onChange={e => {
                      const newOrder = { ...selectedOrder, progress: Number(e.target.value) };
                      setSelectedOrder(newOrder);
                    }}
                  />
                  <span className="text-sm">%</span>
                </div>
                <button 
                  onClick={() => {
                    handleUpdateStatus(selectedOrder.id, selectedOrder.status, selectedOrder.notes, selectedOrder.progress);
                  }}
                  className="px-6 py-2 bg-neon-purple text-white rounded-xl font-medium"
                >
                  Simpan Progress
                </button>
                <button 
                  onClick={() => {
                    const notes = prompt("Tambahkan catatan (opsional):", selectedOrder.notes || "");
                    if (notes !== null) handleUpdateStatus(selectedOrder.id, selectedOrder.status, notes, selectedOrder.progress);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-medium"
                >
                  Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Consult Detail Modal */}
      {selectedConsult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedConsult(null)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
              <h3 className="text-xl font-bold font-display">Detail Konsultasi: {selectedConsult.consultationNo}</h3>
              <button onClick={() => setSelectedConsult(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 space-y-6">
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Informasi Klien</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nama:</span> {selectedConsult.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedConsult.email}</p>
                  <p><span className="font-medium">WhatsApp:</span> {selectedConsult.whatsapp}</p>
                  <p><span className="font-medium">Bisnis:</span> {selectedConsult.business}</p>
                  <p><span className="font-medium">Negara / Bahasa:</span> {selectedConsult.country} / {selectedConsult.language}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Detail Kebutuhan ({selectedConsult.webType})</h4>
                <p className="font-bold text-lg mb-2">{selectedConsult.topic}</p>
                <p className="text-sm bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-white/10 whitespace-pre-wrap">{selectedConsult.desc}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Catatan Admin</h4>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 focus:border-neon-purple outline-none text-sm"
                  rows={4}
                  value={selectedConsult.notes || ''}
                  onChange={e => {
                    const newC = {...selectedConsult, notes: e.target.value};
                    setSelectedConsult(newC);
                  }}
                  placeholder="Tambahkan catatan hasil konsultasi di sini..."
                ></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black flex justify-between items-center">
              <div className="flex gap-4">
                <select 
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10"
                  value={selectedConsult.status}
                  onChange={e => {
                    const newC = {...selectedConsult, status: e.target.value};
                    setSelectedConsult(newC);
                  }}
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Dijadwalkan">Dijadwalkan</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  fetch(`/api/admin/consultations/${selectedConsult.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({status: selectedConsult.status, notes: selectedConsult.notes})
                  }).then(() => {
                    fetchData();
                    setSelectedConsult(null);
                  });
                }}
                className="px-6 py-2 bg-neon-purple text-white rounded-xl font-medium"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedQuote(null)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
              <h3 className="text-xl font-bold font-display">Detail Penawaran: {selectedQuote.quoteNo}</h3>
              <button onClick={() => setSelectedQuote(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Informasi Peminta</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Nama:</span> {selectedQuote.request?.name}</p>
                    <p><span className="font-medium">Perusahaan:</span> {selectedQuote.request?.company || '-'}</p>
                    <p><span className="font-medium">Email:</span> {selectedQuote.request?.email}</p>
                    <p><span className="font-medium">WhatsApp:</span> {selectedQuote.request?.whatsapp}</p>
                    <p><span className="font-medium">Negara / Bahasa:</span> {selectedQuote.request?.country} / {selectedQuote.request?.language}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Kebutuhan Proyek</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Jenis Web:</span> {selectedQuote.request?.webType}</p>
                    <p><span className="font-medium">Paket:</span> {selectedQuote.request?.package}</p>
                    <p><span className="font-medium">Jumlah Halaman:</span> {selectedQuote.request?.pages}</p>
                    <p><span className="font-medium">Domain / Hosting:</span> {selectedQuote.request?.domain} / {selectedQuote.request?.hosting}</p>
                    <p><span className="font-medium">Budget / Deadline:</span> {selectedQuote.request?.budget} / {selectedQuote.request?.deadline}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Deskripsi & Fitur Tambahan</h4>
                <p className="text-sm bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-white/10 mb-2">Fitur: {selectedQuote.request?.features || '-'}</p>
                <p className="text-sm bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-white/10 whitespace-pre-wrap">{selectedQuote.request?.desc}</p>
              </div>

              <div>
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Estimasi Diberikan</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Estimasi IDR</p>
                    <p className="font-bold">Rp {((selectedQuote?.result as any)?.priceIdr || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Estimasi USD</p>
                    <p className="font-bold">${((selectedQuote?.result as any)?.priceUsd || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Estimasi Waktu</p>
                    <p className="font-bold">{selectedQuote.result?.eta}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Paket Rekomendasi</p>
                    <p className="font-bold">{selectedQuote.result?.recommended}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black flex justify-between items-center">
              <button 
                onClick={() => setSelectedQuote(null)}
                className="px-6 py-2 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black">
              <h3 className="text-xl font-bold font-display">Detail Pengaduan: {selectedTicket.ticketNo}</h3>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 space-y-6">
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Informasi Pelapor</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nama:</span> {selectedTicket.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedTicket.email}</p>
                  <p><span className="font-medium">WhatsApp:</span> {selectedTicket.whatsapp}</p>
                  {selectedTicket.orderNo && <p><span className="font-medium">No Pesanan:</span> {selectedTicket.orderNo}</p>}
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Detail Masalah ({selectedTicket.category})</h4>
                <p className="font-bold text-lg mb-2">{selectedTicket.title}</p>
                <p className="text-sm bg-gray-50 dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-white/10 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black">
              <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-4">Ubah Status Pengaduan</h4>
              <div className="flex gap-4">
                <select 
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 flex-1"
                  onChange={e => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                  value={selectedTicket.status}
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Dibalas">Dibalas</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditutup">Ditutup</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
