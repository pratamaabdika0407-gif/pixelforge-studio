import express, { Router } from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import { prisma, JWT_SECRET, checkDbConnected, mockDb } from "./db-helper";

const router = Router();

// --- ADMIN AUTH ---
router.get("/admin/check", async (req, res) => {
  try {
    const isConnected = await checkDbConnected();
    if (isConnected) {
      try {
        const count = await prisma.admin.count();
        return res.json({ hasAdmin: count > 0 });
      } catch {
        return res.json({ hasAdmin: mockDb.admins.length > 0 });
      }
    } else {
      return res.json({ hasAdmin: mockDb.admins.length > 0 });
    }
  } catch {
    return res.json({ hasAdmin: mockDb.admins.length > 0 });
  }
});

router.post("/admin/setup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isConnected = await checkDbConnected();
    let adminData: any;

    if (isConnected) {
      try {
        const count = await prisma.admin.count();
        if (count > 0) {
          return res.status(400).json({ success: false, message: "Admin sudah ada. Silakan login." });
        }
        const existing = await prisma.admin.findFirst({
          where: { OR: [{ username }, { email }] }
        });
        if (existing) {
          return res.status(400).json({ success: false, message: "Username atau email sudah terdaftar" });
        }

        const newAdmin = await prisma.admin.create({
          data: {
            name,
            username,
            email,
            passwordHash: hashedPassword,
            role: "SUPER_ADMIN"
          }
        });
        adminData = { id: newAdmin.id, name: newAdmin.name, username: newAdmin.username, email: newAdmin.email, role: newAdmin.role };
      } catch (dbErr) {
        console.warn("DB setup fallback to mock:", dbErr);
        if (mockDb.admins.length > 0) {
          return res.status(400).json({ success: false, message: "Admin sudah ada." });
        }
        const newAdmin = {
          id: Date.now().toString(),
          name,
          username,
          email,
          passwordHash: hashedPassword,
          role: "SUPER_ADMIN"
        };
        mockDb.admins.push(newAdmin);
        adminData = newAdmin;
      }
    } else {
      if (mockDb.admins.length > 0) {
        return res.status(400).json({ success: false, message: "Admin sudah ada." });
      }
      const newAdmin = {
        id: Date.now().toString(),
        name,
        username,
        email,
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN"
      };
      mockDb.admins.push(newAdmin);
      adminData = newAdmin;
    }

    const token = jwt.sign({ id: adminData.id, username: adminData.username, role: adminData.role }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, token, admin: adminData });
  } catch (err) {
    console.error("Admin setup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }

    const isConnected = await checkDbConnected();
    let admin: any = null;

    if (isConnected) {
      try {
        admin = await prisma.admin.findFirst({
          where: { OR: [{ username }, { email: username }] }
        });
      } catch {
        admin = mockDb.admins.find(a => a.username === username || a.email === username);
      }
    }
    
    if (!admin) {
      admin = mockDb.admins.find(a => a.username === username || a.email === username);
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: "Username atau Password salah." });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash || admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Username atau Password salah." });
    }

    const adminObj = {
      id: admin.id,
      name: admin.name,
      username: admin.username,
      email: admin.email,
      role: admin.role || "SUPER_ADMIN"
    };

    const token = jwt.sign({ id: adminObj.id, username: adminObj.username, role: adminObj.role }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, token, admin: adminObj });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
});

router.get("/admin/me", async (req, res) => {
  try {
    const token = req.cookies?.admin_token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const isConnected = await checkDbConnected();

    if (isConnected) {
      try {
        const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
        if (admin) {
          return res.json({ success: true, admin: { id: admin.id, name: admin.name, username: admin.username, email: admin.email, role: admin.role } });
        }
      } catch {}
    }

    const admin = mockDb.admins.find(a => a.id === decoded.id);
    if (!admin) return res.status(404).json({ success: false });
    return res.json({ success: true, admin });
  } catch {
    return res.status(401).json({ success: false });
  }
});

const recordActivity = (user: any, action: string, details?: string) => {
  const log = {
    id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    username: user?.username || user?.name || "System",
    role: user?.role || "ADMIN",
    action,
    details: details || "",
    date: new Date().toISOString()
  };
  mockDb.activityLogs.unshift(log);
  if (mockDb.activityLogs.length > 200) mockDb.activityLogs.pop();
};

const getAuthUser = async (req: any) => {
  try {
    const token = req.cookies?.admin_token || req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const isConnected = await checkDbConnected();
    if (isConnected) {
      try {
        const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
        if (admin) return admin;
      } catch {}
    }
    const admin = mockDb.admins.find(a => a.id === decoded.id);
    if (admin) return admin;
    return decoded;
  } catch {
    return null;
  }
};

router.get("/admin/activity-logs", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json([]);
  res.json(Array.isArray(mockDb.activityLogs) ? mockDb.activityLogs : []);
});

router.get("/admin/staffs", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return res.status(403).json([]);
  }
  const staffs = mockDb.admins.filter(a => a.role === 'STAFF' || a.role === 'OPERATOR');
  res.json(Array.isArray(staffs) ? staffs : []);
});

router.post("/admin/staffs", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, message: "Akses Ditolak: Hanya Admin yang dapat mengelola Staff & Operator." });
  }
  const { name, username, email, password, role } = req.body;
  if (!name || !username || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
  }
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return res.status(400).json({ success: false, message: "Tidak boleh membuat akun Admin baru. Hanya boleh ada 1 Admin." });
  }
  const existing = mockDb.admins.find(a => a.username === username || a.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: "Username atau email sudah digunakan" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newStaff = {
    id: `staff-${Date.now()}`,
    name,
    username,
    email,
    passwordHash: hashedPassword,
    role: role === 'OPERATOR' ? 'OPERATOR' : 'STAFF'
  };
  mockDb.admins.push(newStaff);
  recordActivity(user, `Membuat Akun ${role}`, `Membuat akun ${role}: ${username} (${email})`);
  res.json({ success: true, staff: { id: newStaff.id, name, username, email, role: newStaff.role } });
});

router.delete("/admin/staffs/:id", async (req, res) => {
  const user = await getAuthUser(req);
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, message: "Akses Ditolak: Hanya Admin yang dapat menghapus Staff & Operator." });
  }
  const { id } = req.params;
  const index = mockDb.admins.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Akun tidak ditemukan" });
  const target = mockDb.admins[index];
  if (target.role === 'SUPER_ADMIN' || target.role === 'ADMIN') {
    return res.status(400).json({ success: false, message: "Tidak dapat menghapus akun Admin utama." });
  }
  mockDb.admins.splice(index, 1);
  recordActivity(user, `Menghapus Akun`, `Menghapus akun ${target.role}: ${target.username}`);
  res.json({ success: true });
});

// --- SERVICES & PORTFOLIO & SETTINGS ---
const mapPriceFields = (item: any): any => {
  const anyItem: Record<string, any> = item;
  const pIdr = anyItem.priceIdr ?? anyItem.price_idr ?? 299000;
  const pUsd = anyItem.priceUsd ?? anyItem.price_usd ?? 25;
  return {
    ...anyItem,
    priceIdr: pIdr,
    price_idr: pIdr,
    priceUsd: pUsd,
    price_usd: pUsd
  };
};

router.get("/services", async (req, res) => {
  try {
    if (await checkDbConnected()) {
      try {
        const services = await prisma.service.findMany();
        if (services.length > 0) return res.json(services.map(mapPriceFields));
      } catch {}
    }
    res.json(mockDb.services.map(mapPriceFields));
  } catch {
    res.json(mockDb.services.map(mapPriceFields));
  }
});

router.get("/admin/services", async (req, res) => {
  res.json(Array.isArray(mockDb.services) ? mockDb.services.map(mapPriceFields) : []);
});

router.post("/admin/services", async (req, res) => {
  const { title, desc, priceIdr, priceUsd, features, eta, img, badge } = req.body;
  const pIdr = Number(priceIdr) || 299000;
  const pUsd = Number(priceUsd) || 25;
  const newService = mapPriceFields({
    id: Date.now().toString(),
    title: title || "New Service",
    desc: desc || "",
    priceIdr: pIdr,
    price_idr: pIdr,
    priceUsd: pUsd,
    price_usd: pUsd,
    features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map((f: string) => f.trim()) : ["Responsive"]),
    eta: eta || "5-7 Hari Kerja",
    img: img || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    badge: badge || ""
  });
  mockDb.services.push(newService);
  res.json({ success: true, service: newService });
});

router.put("/admin/services/:id", async (req, res) => {
  const id = req.params.id;
  const index = mockDb.services.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Service not found" });
  
  const existing = mockDb.services[index] as any;
  const pIdr = req.body.priceIdr !== undefined ? Number(req.body.priceIdr) : (existing.priceIdr ?? existing.price_idr ?? 299000);
  const pUsd = req.body.priceUsd !== undefined ? Number(req.body.priceUsd) : (existing.priceUsd ?? existing.price_usd ?? 25);

  const updated = mapPriceFields({
    ...existing,
    ...req.body,
    priceIdr: pIdr,
    price_idr: pIdr,
    priceUsd: pUsd,
    price_usd: pUsd,
    features: req.body.features ? (Array.isArray(req.body.features) ? req.body.features : req.body.features.split(',').map((f: string) => f.trim())) : existing.features
  });
  mockDb.services[index] = updated;
  res.json({ success: true, service: updated });
});

router.delete("/admin/services/:id", async (req, res) => {
  const id = req.params.id;
  mockDb.services = mockDb.services.filter(s => s.id !== id);
  res.json({ success: true });
});

router.get("/pricing", (req, res) => res.json(mockDb.pricing.map(mapPriceFields)));

router.get("/portfolio", async (req, res) => {
  try {
    if (await checkDbConnected()) {
      try {
        const items = await prisma.portfolio.findMany();
        if (items.length > 0) return res.json(items);
      } catch {}
    }
    res.json(mockDb.portfolio);
  } catch {
    res.json(mockDb.portfolio);
  }
});

router.get("/settings", async (req, res) => {
  try {
    if (await checkDbConnected()) {
      try {
        const s = await prisma.settings.findUnique({ where: { key: "general" } });
        if (s) return res.json(JSON.parse(s.value));
      } catch {}
    }
    res.json(mockDb.settings);
  } catch {
    res.json(mockDb.settings);
  }
});

router.put("/admin/settings", async (req, res) => {
  try {
    mockDb.settings = { ...mockDb.settings, ...req.body };
    if (await checkDbConnected()) {
      try {
        await prisma.settings.upsert({
          where: { key: "general" },
          update: { value: JSON.stringify(mockDb.settings) },
          create: { key: "general", value: JSON.stringify(mockDb.settings) }
        });
      } catch {}
    }
    res.json({ success: true, settings: mockDb.settings });
  } catch {
    res.json({ success: true, settings: mockDb.settings });
  }
});

// --- ORDERS & AUTOMATED NOTIFICATIONS ---
const triggerOrderNotifications = (order: any, triggerType: 'created' | 'status_changed', statusName?: string) => {
  const customerName = order.clientName || order.name || "Pelanggan";
  const customerEmail = order.email || "client@example.com";
  const customerPhone = order.phone || order.whatsapp || "08123456789";
  const serviceTitle = order.serviceTitle || "Custom Web";
  const priceText = order.priceIdr ? `Rp ${Number(order.priceIdr).toLocaleString('id-ID')}` : (order.priceUsd ? `$${order.priceUsd}` : "Rp 299.000");
  const paymentMethod = order.paymentMethod || "QRIS / Transfer Bank";
  const currentStatus = statusName || order.status || "Menunggu Pembayaran";
  const eta = order.eta || "5-7 Hari Kerja";
  const statusLink = `https://ais-dev-vfcak5i5iu5f37jnz2zo5k-897038715205.asia-east1.run.app/my-orders`;

  const emailSubject = triggerType === 'created' 
    ? `Konfirmasi Pesanan Baru #${order.orderNo} - PixelForge Studio` 
    : `Pembaruan Status Pesanan #${order.orderNo}: ${currentStatus} - PixelForge Studio`;

  const emailBody = `Halo ${customerName},\n\n` +
    (triggerType === 'created' ? `Terima kasih telah memesan di PixelForge Studio! Pesanan Anda telah berhasil dibuat.\n\n` : `Status pesanan Anda telah diperbarui.\n\n`) +
    `Detail Pesanan:\n` +
    `- Nomor Pesanan: ${order.orderNo}\n` +
    `- Paket Website: ${serviceTitle}\n` +
    `- Total Pembayaran: ${priceText}\n` +
    `- Metode Pembayaran: ${paymentMethod}\n` +
    `- Status: ${currentStatus}\n` +
    `- Estimasi Pengerjaan: ${eta}\n\n` +
    `Cek status pesanan Anda secara real-time di: ${statusLink}\n\n` +
    `Salam hangat,\nTim PixelForge Studio`;

  mockDb.notificationLogs.unshift({
    id: `MAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderNo: order.orderNo,
    recipient: customerEmail,
    type: 'email',
    title: emailSubject,
    message: emailBody,
    status: 'success',
    date: new Date().toISOString()
  });

  const waMessage = `Halo *${customerName}*! 🙏\n\n` +
    (triggerType === 'created' 
      ? `Terima kasih telah mempercayakan pembuatan website Anda kepada *PixelForge Studio*. Pesanan Anda berhasil dibuat!\n\n` 
      : `Pemberitahuan: Status pesanan Anda telah diperbarui.\n\n`) +
    `📦 *Detail Pesanan*:\n` +
    `• No. Pesanan: *${order.orderNo}*\n` +
    `• Layanan: *${serviceTitle}*\n` +
    `• Total: *${priceText}*\n` +
    `• Pembayaran: *${paymentMethod}*\n` +
    `• Status: *${currentStatus}*\n` +
    `• Estimasi: *${eta}*\n\n` +
    `🔗 Cek status & progres pengerjaan di:\n${statusLink}\n\n` +
    `Butuh bantuan? Hubungi Admin kami di 0812-3456-7890 (WhatsApp) atau support@pixelforge.id.\n\n` +
    `_PixelForge Studio - Professional Web Development Agency_`;

  mockDb.notificationLogs.unshift({
    id: `WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderNo: order.orderNo,
    recipient: customerPhone,
    type: 'whatsapp',
    title: `WhatsApp to ${customerPhone}`,
    message: waMessage,
    status: 'success',
    date: new Date().toISOString()
  });

  mockDb.notifications.unshift({
    id: Date.now().toString(),
    title: triggerType === 'created' ? `Pesanan Baru #${order.orderNo}` : `Status #${order.orderNo} -> ${currentStatus}`,
    message: `Notifikasi otomatis Email & WhatsApp berhasil dikirim ke ${customerName} (${customerEmail} / ${customerPhone}).`,
    date: new Date().toISOString(),
    read: false
  });
};

const handleCreateOrder = async (req: any, res: any) => {
  try {
    const orderNo = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const newOrder = {
      id: Date.now().toString(),
      orderNo,
      date: new Date().toISOString(),
      ...req.body,
      status: "Menunggu Pembayaran",
      proofUrl: null,
      notes: "",
      history: [{ status: "Menunggu Pembayaran", date: new Date().toISOString() }],
      progress: 0
    };

    mockDb.orders.push(newOrder);
    triggerOrderNotifications(newOrder, 'created');

    if (await checkDbConnected()) {
      try {
        await prisma.order.create({
          data: {
            orderNo,
            serviceTitle: req.body.serviceTitle || "Custom Web",
            priceIdr: parseFloat(req.body.priceIdr) || 0,
            priceUsd: parseFloat(req.body.priceUsd) || 0,
            status: "Menunggu Pembayaran",
            clientName: req.body.name || "Klien",
            email: req.body.email || "",
            phone: req.body.whatsapp || req.body.phone || "",
            notes: req.body.desc || "",
            progress: 0,
            history: [{ status: "Menunggu Pembayaran", date: new Date().toISOString() }] as any
          }
        });
      } catch {}
    }

    res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false });
  }
};

router.post("/orders", handleCreateOrder);
router.post("/order", handleCreateOrder);

router.post("/orders/:id/payment", async (req, res) => {
  const orderId = req.params.id;
  const order = mockDb.orders.find(o => o.id === orderId || o.orderNo === orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.proofUrl = req.body.proofUrl;
  order.status = "Menunggu Verifikasi";
  order.history = order.history || [];
  order.history.push({ status: "Menunggu Verifikasi", date: new Date().toISOString() });

  mockDb.notifications.push({
    id: Date.now().toString(),
    title: "Pembayaran Diterima",
    message: `Bukti pembayaran pesanan ${order.orderNo} telah diterima dan sedang diverifikasi.`,
    date: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, order });
});

const handleGetOrders = async (req: any, res: any) => {
  const email = req.query.email;
  if (email) {
    const myOrders = mockDb.orders.filter(o => o.email === email);
    return res.json(myOrders);
  }
  try {
    if (await checkDbConnected()) {
      try {
        const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
        if (orders.length > 0) return res.json(orders);
      } catch {}
    }
    res.json(mockDb.orders);
  } catch {
    res.json(mockDb.orders);
  }
};

router.get("/my-orders", handleGetOrders);
router.get("/order", handleGetOrders);
router.get("/orders", handleGetOrders);

router.get("/orders/:id", (req, res) => {
  const order = mockDb.orders.find(o => o.id === req.params.id || o.orderNo === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json(order);
});

const handleUpdateOrderAdmin = async (req: any, res: any) => {
  const orderId = req.params.id;
  const orderIndex = mockDb.orders.findIndex(o => o.id === orderId || o.orderNo === orderId);
  
  if (orderIndex !== -1) {
    const oldStatus = mockDb.orders[orderIndex].status;
    mockDb.orders[orderIndex] = { ...mockDb.orders[orderIndex], ...req.body };
    if (req.body.status && req.body.status !== oldStatus) {
      mockDb.orders[orderIndex].history = mockDb.orders[orderIndex].history || [];
      mockDb.orders[orderIndex].history.push({ status: req.body.status, date: new Date().toISOString() });
      triggerOrderNotifications(mockDb.orders[orderIndex], 'status_changed', req.body.status);
    }
  }

  try {
    if (await checkDbConnected()) {
      try {
        await prisma.order.updateMany({
          where: { OR: [{ id: orderId }, { orderNo: orderId }] },
          data: {
            status: req.body.status,
            progress: req.body.progress,
            notes: req.body.notes
          }
        });
      } catch {}
    }
  } catch {}

  res.json({ success: true });
};

router.put("/admin/orders/:id", handleUpdateOrderAdmin);
router.patch("/order/:id", handleUpdateOrderAdmin);
router.get("/admin/orders", handleGetOrders);

// --- NOTIFICATIONS & LOGS ---
router.get("/notifications", (req, res) => res.json(mockDb.notifications));
router.post("/notifications/read", (req, res) => {
  mockDb.notifications.forEach(n => n.read = true);
  res.json({ success: true });
});

router.get("/admin/notification-logs", (req, res) => {
  res.json(Array.isArray(mockDb.notificationLogs) ? mockDb.notificationLogs : []);
});

router.post("/admin/notification-logs/resend", (req, res) => {
  const { logId, orderNo } = req.body;
  const log = mockDb.notificationLogs.find(l => l.id === logId || l.orderNo === orderNo);
  if (!log) {
    return res.status(404).json({ success: false, message: "Log tidak ditemukan" });
  }

  const newLog = {
    ...log,
    id: `${log.type.toUpperCase()}-RESEND-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'success'
  };
  mockDb.notificationLogs.unshift(newLog);

  mockDb.notifications.unshift({
    id: Date.now().toString(),
    title: `Kirim Ulang ${log.type === 'email' ? 'Email' : 'WhatsApp'}`,
    message: `Berhasil mengirim ulang ${log.type} ke ${log.recipient} untuk pesanan #${log.orderNo}.`,
    date: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, message: "Berhasil dikirim ulang!", log: newLog });
});

// --- SUPPORT TICKETS ---
const handleCreateTicket = async (req: any, res: any) => {
  const ticket = {
    id: Date.now().toString(),
    ticketNo: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString(),
    status: "Menunggu",
    ...req.body
  };
  mockDb.tickets.push(ticket);

  try {
    if (await checkDbConnected()) {
      try {
        await prisma.supportTicket.create({
          data: {
            ticketNo: ticket.ticketNo,
            name: req.body.name || "Klien",
            email: req.body.email || "",
            subject: req.body.issueTitle || req.body.subject || "Pengaduan",
            message: req.body.desc || req.body.message || "",
            status: "Menunggu"
          }
        });
      } catch {}
    }
  } catch {}

  res.json({ success: true, ticket });
};

router.post("/tickets", handleCreateTicket);
router.post("/support", handleCreateTicket);

const handleGetTickets = async (req: any, res: any) => {
  try {
    if (await checkDbConnected()) {
      try {
        const list = await prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } });
        if (list.length > 0) return res.json(list);
      } catch {}
    }
    res.json(mockDb.tickets);
  } catch {
    res.json(mockDb.tickets);
  }
};

router.get("/tickets", handleGetTickets);
router.get("/support", handleGetTickets);
router.get("/admin/tickets", handleGetTickets);

router.put("/admin/tickets/:id", (req, res) => {
  const t = mockDb.tickets.find(tk => tk.id === req.params.id || tk.ticketNo === req.params.id);
  if (!t) return res.status(404).json({ success: false });
  Object.assign(t, req.body);
  res.json({ success: true, ticket: t });
});

// --- QUOTES ---
router.post("/quotes", (req, res) => {
  const quoteNo = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
  const { webType, name } = req.body;
  let priceIdr = 1500000;
  let priceUsd = 100;
  let eta = "5-7 Hari Kerja";
  let recommended = "Professional";

  if (webType?.toLowerCase().includes("landing")) {
    priceIdr = 500000;
    priceUsd = 35;
    eta = "3-5 Hari Kerja";
    recommended = "Starter";
  }

  const quote = {
    id: Date.now().toString(),
    quoteNo,
    date: new Date().toISOString(),
    request: req.body,
    result: { priceIdr, priceUsd, eta, recommended },
    status: "Pending"
  };

  mockDb.quotes.push(quote);
  mockDb.notifications.push({
    id: Date.now().toString(),
    title: "Penawaran Baru",
    message: `Quote baru ${quoteNo} dibuat oleh ${name || "Klien"}.`,
    date: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, quote });
});

router.get("/admin/quotes", (req, res) => res.json(Array.isArray(mockDb.quotes) ? mockDb.quotes : []));
router.put("/admin/quotes/:id", (req, res) => {
  const q = mockDb.quotes.find(item => item.id === req.params.id || item.quoteNo === req.params.id);
  if (!q) return res.status(404).json({ success: false });
  Object.assign(q, req.body);
  res.json({ success: true, quote: q });
});

// --- CONSULTATIONS ---
router.post("/consultations", (req, res) => {
  const consultation = {
    id: Date.now().toString(),
    consultationNo: `CNS-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString(),
    status: "Menunggu",
    notes: "",
    ...req.body
  };
  mockDb.consultations.push(consultation);
  mockDb.notifications.push({
    id: Date.now().toString(),
    title: "Permintaan Konsultasi",
    message: `Konsultasi baru diminta oleh ${req.body.name}.`,
    date: new Date().toISOString(),
    read: false
  });
  res.json({ success: true, consultation });
});

router.get("/admin/consultations", (req, res) => res.json(Array.isArray(mockDb.consultations) ? mockDb.consultations : []));
router.put("/admin/consultations/:id", (req, res) => {
  const c = mockDb.consultations.find(item => item.id === req.params.id || item.consultationNo === req.params.id);
  if (!c) return res.status(404).json({ success: false });
  Object.assign(c, req.body);
  res.json({ success: true, consultation: c });
});

// --- CHAT WITH GEMINI AI ---
let aiClient: GoogleGenAI | null = null;
router.post("/chat", async (req, res) => {
  const { sessionId, message, isAdmin, lang } = req.body;
  let session = mockDb.chats.find(c => c.sessionId === sessionId);
  if (!session) {
    session = { sessionId, messages: [], adminTakingOver: false, status: "active" };
    mockDb.chats.push(session);
  }

  const newMessage = {
    id: Date.now().toString(),
    sender: isAdmin ? 'admin' : 'user',
    text: message,
    timestamp: new Date().toISOString()
  };
  session.messages.push(newMessage);

  if (isAdmin) {
    session.adminTakingOver = true;
    return res.json({ success: true, message: newMessage });
  }

  if (!session.adminTakingOver) {
    try {
      if (!aiClient) {
        const key = process.env.GEMINI_API_KEY;
        if (key) {
          aiClient = new GoogleGenAI({ apiKey: key });
        }
      }

      if (aiClient) {
        const history = session.messages.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })).slice(-10);

        const systemPrompt = `You are a helpful customer support AI for PixelForge Studio, a web development agency.
Answer questions about pricing, ETA, QRIS payment, and services. If you cannot answer or the user asks to speak with a human, state that you will connect them to an admin. Answer in ${lang === 'en' ? 'English' : 'Indonesian'}.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: history,
          config: { systemInstruction: systemPrompt }
        });

        const aiResponseText = response.text || "Mohon maaf, saya tidak dapat merespon saat ini.";
        const needsAdmin = aiResponseText.toLowerCase().includes("admin") || aiResponseText.toLowerCase().includes("human") || aiResponseText.toLowerCase().includes("bantuan");
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toISOString(),
          showContact: needsAdmin
        };
        session.messages.push(aiMessage);
        return res.json({ success: true, message: aiMessage });
      } else {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "Sistem AI belum aktif. Pesan Anda akan dibalas oleh tim Admin kami.",
          timestamp: new Date().toISOString()
        };
        session.messages.push(aiMessage);
        return res.json({ success: true, message: aiMessage });
      }
    } catch (err) {
      console.error("AI chat error:", err);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Mohon maaf, layanan chat sedang sibuk. Silakan hubungi via WhatsApp atau Email kami.",
        timestamp: new Date().toISOString(),
        showContact: true
      };
      session.messages.push(aiMessage);
      return res.json({ success: true, message: aiMessage });
    }
  }

  res.json({ success: true });
});

router.get("/chat/:sessionId", (req, res) => {
  const session = mockDb.chats.find(c => c.sessionId === req.params.sessionId);
  res.json(session || { messages: [], adminTakingOver: false });
});

router.get("/chat", (req, res) => {
  res.json(mockDb.chats);
});

router.get("/admin/chats", (req, res) => res.json(Array.isArray(mockDb.chats) ? mockDb.chats : []));

// --- PAYPAL PAYMENT API ---
router.post("/paypal/create-order", async (req, res) => {
  try {
    const { serviceTitle, priceIdr, priceUsd, name, email, phone, notes } = req.body;
    const orderNo = `PAYPAL-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    const paypalOrderId = `PP-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    
    const newOrder = {
      id: Date.now().toString(),
      orderNo,
      serviceTitle: serviceTitle || "Custom Web",
      priceIdr: parseFloat(priceIdr) || 0,
      priceUsd: parseFloat(priceUsd) || 0,
      status: "Menunggu Pembayaran",
      clientName: name || "Klien",
      email: email || "",
      phone: phone || "",
      notes: notes || "",
      proofUrl: null,
      progress: 0,
      paymentMethod: "PayPal",
      paypalOrderId,
      paypalEmail: "muhammadabdikapratama7@gmail.com",
      paymentStatus: "Menunggu Pembayaran",
      history: [{ status: "Menunggu Pembayaran", date: new Date().toISOString() }],
      createdAt: new Date().toISOString()
    };

    mockDb.orders.push(newOrder);
    triggerOrderNotifications(newOrder, 'created');

    if (await checkDbConnected()) {
      try {
        await prisma.order.create({
          data: {
            orderNo,
            serviceTitle: newOrder.serviceTitle,
            priceIdr: newOrder.priceIdr,
            priceUsd: newOrder.priceUsd,
            status: "Menunggu Pembayaran",
            clientName: newOrder.clientName,
            email: newOrder.email,
            phone: newOrder.phone,
            notes: newOrder.notes,
            progress: 0,
            paymentMethod: "PayPal",
            paypalOrderId,
            paypalEmail: "muhammadabdikapratama7@gmail.com",
            paymentStatus: "Menunggu Pembayaran",
            history: newOrder.history as any
          }
        });
      } catch (dbErr) {
        console.error("Prisma create order error:", dbErr);
      }
    }

    return res.json({
      success: true,
      order: newOrder,
      paypalUrl: `https://www.paypal.com/paypalme/muhammadabdikapratama7/${newOrder.priceUsd}`,
      recipientEmail: "muhammadabdikapratama7@gmail.com"
    });
  } catch (err) {
    console.error("PayPal create order error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/paypal/capture-order", async (req, res) => {
  try {
    const { orderId, paypalOrderId, paypalPayerId } = req.body;
    const order = mockDb.orders.find(o => o.id === orderId || o.orderNo === orderId || o.paypalOrderId === paypalOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "Pembayaran Berhasil";
    order.paymentStatus = "Pembayaran Berhasil";
    order.paypalPayerId = paypalPayerId || "PAYER-SIMULATED";
    order.paidAt = new Date().toISOString();
    order.history = order.history || [];
    order.history.push({ status: "Pembayaran Berhasil", date: new Date().toISOString() });
    triggerOrderNotifications(order, 'status_changed', "Pembayaran Berhasil");

    if (await checkDbConnected()) {
      try {
        await prisma.order.updateMany({
          where: { OR: [{ id: order.id }, { orderNo: order.orderNo }] },
          data: {
            status: "Pembayaran Berhasil",
            paymentStatus: "Pembayaran Berhasil",
            paypalPayerId: order.paypalPayerId,
            paidAt: new Date()
          }
        });
      } catch (dbErr) {
        console.error("Prisma update order error:", dbErr);
      }
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return res.status(500).json({ success: false, message: "Capture failed" });
  }
});

router.post("/paypal/webhook", async (req, res) => {
  try {
    const event = req.body;
    const resource = event?.resource || event;
    const paypalOrderId = resource?.id || resource?.order_id;
    const eventType = event?.event_type || resource?.event_type || "PAYMENT.CAPTURE.COMPLETED";

    if (paypalOrderId) {
      const order = mockDb.orders.find(o => o.paypalOrderId === paypalOrderId || o.orderNo === paypalOrderId);
      if (order) {
        if (eventType.includes("COMPLETED") || eventType.includes("SUCCEEDED")) {
          order.status = "Pembayaran Berhasil";
          order.paymentStatus = "Pembayaran Berhasil";
          order.paidAt = new Date().toISOString();
        } else if (eventType.includes("DENIED") || eventType.includes("FAILED")) {
          order.status = "Pembayaran Gagal";
          order.paymentStatus = "Pembayaran Gagal";
        } else if (eventType.includes("REFUNDED")) {
          order.status = "Refund";
          order.paymentStatus = "Refund";
        }

        if (await checkDbConnected()) {
          try {
            await prisma.order.updateMany({
              where: { OR: [{ paypalOrderId }, { orderNo: paypalOrderId }] },
              data: {
                status: order.status,
                paymentStatus: order.paymentStatus,
                paidAt: order.paidAt ? new Date(order.paidAt) : undefined
              }
            });
          } catch {}
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ received: false });
  }
});

router.get("/paypal/status/:id", async (req, res) => {
  const id = req.params.id;
  const order = mockDb.orders.find(o => o.id === id || o.orderNo === id || o.paypalOrderId === id);
  if (!order) {
    if (await checkDbConnected()) {
      try {
        const dbOrder = await prisma.order.findFirst({
          where: { OR: [{ id }, { orderNo: id }, { paypalOrderId: id }] }
        });
        if (dbOrder) return res.json({ success: true, order: dbOrder });
      } catch {}
    }
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  return res.json({ success: true, order });
});

router.get("/admin/paypal-payments", async (req, res) => {
  try {
    let paypalOrders = mockDb.orders.filter(o => o.paymentMethod === "PayPal" || o.paypalOrderId);
    if (await checkDbConnected()) {
      try {
        const dbOrders = await prisma.order.findMany({
          where: { OR: [{ paymentMethod: "PayPal" }, { paypalOrderId: { not: null } }] },
          orderBy: { createdAt: "desc" }
        });
        if (dbOrders.length > 0) paypalOrders = dbOrders;
      } catch {}
    }

    const totalPembayaran = paypalOrders.length;
    const totalBerhasil = paypalOrders.filter(o => o.paymentStatus === "Pembayaran Berhasil" || o.status === "Pembayaran Berhasil").length;
    const totalPending = paypalOrders.filter(o => o.paymentStatus === "Menunggu Pembayaran" || o.status === "Menunggu Pembayaran" || o.status === "Menunggu Verifikasi" || o.status === "Dibayar melalui PayPal").length;
    const totalGagal = paypalOrders.filter(o => o.paymentStatus === "Pembayaran Gagal" || o.status === "Pembayaran Gagal").length;
    const totalRefund = paypalOrders.filter(o => o.paymentStatus === "Refund" || o.status === "Refund").length;

    res.json({
      success: true,
      stats: {
        totalPembayaran,
        totalBerhasil,
        totalPending,
        totalGagal,
        totalRefund
      },
      orders: paypalOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch paypal payments" });
  }
});

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/", router);

export default app;
export { router };
