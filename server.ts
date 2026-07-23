import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "./src/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "pixelforge-super-secret-jwt-key-2026";

// Mock Fallback Database in case Prisma fails or DB is unmigrated
const mockDb = {
  services: [
    { id: "1", title: "Landing Page", desc: "One-page website for promotions.", priceIdr: 500000, priceUsd: 35, features: ["Responsive", "Fast", "SEO Basic"], eta: "3–5 Hari Kerja", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" },
    { id: "2", title: "Company Profile", desc: "Professional web for businesses.", priceIdr: 1500000, priceUsd: 100, features: ["5 Pages", "CMS", "SEO Optimized"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" },
    { id: "3", title: "Website Portofolio", desc: "Showcase your best work.", priceIdr: 1000000, priceUsd: 70, features: ["Gallery", "Responsive", "Fast"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800" },
    { id: "4", title: "Website UMKM", desc: "Digitalize your local business.", priceIdr: 1000000, priceUsd: 70, features: ["Catalog", "WhatsApp Order", "Fast"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" },
    { id: "5", title: "Website Restoran", desc: "Online menu & reservations.", priceIdr: 1200000, priceUsd: 85, features: ["Menu List", "Order System", "Map"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" },
    { id: "6", title: "Website Barbershop", desc: "Booking system for barbershops.", priceIdr: 1200000, priceUsd: 85, features: ["Booking Form", "Services", "Staff"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" },
    { id: "7", title: "Blog", desc: "Share your stories.", priceIdr: 800000, priceUsd: 55, features: ["CMS", "Comments", "SEO"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800" },
    { id: "8", title: "Website Sekolah", desc: "Information portal for schools.", priceIdr: 2500000, priceUsd: 175, features: ["E-Learning", "Announcements", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800" },
    { id: "9", title: "Website Klinik", desc: "Healthcare appointments.", priceIdr: 2500000, priceUsd: 175, features: ["Appointments", "Services", "Doctors"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800" },
    { id: "10", title: "Website Travel", desc: "Tour booking and destinations.", priceIdr: 2500000, priceUsd: 175, features: ["Destinations", "Booking", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" },
    { id: "11", title: "Website Properti", desc: "Real estate listings.", priceIdr: 3000000, priceUsd: 200, features: ["Listings", "Search", "Map"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" },
    { id: "12", title: "Website Rental", desc: "Rent cars, bikes, or equipment.", priceIdr: 3000000, priceUsd: 200, features: ["Booking System", "Inventory", "Payments"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800" },
    { id: "13", title: "Website Custom", desc: "Tailored to your specific needs.", priceIdr: 5000000, priceUsd: 350, features: ["Custom Logic", "API Integrations", "Advanced UI"], eta: "Estimasi berdasarkan kebutuhan proyek", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" }
  ],
  pricing: [
    { id: "1", name: "Starter", priceIdr: 500000, priceUsd: 35, features: ["1 Page", "Shared Hosting", "Basic SEO"] },
    { id: "2", name: "Professional", priceIdr: 1500000, priceUsd: 100, features: ["5 Pages", "Free Domain", "Premium Support"] },
    { id: "3", name: "Business", priceIdr: 3000000, priceUsd: 200, features: ["10 Pages", "Advanced SEO", "Custom Design"] },
    { id: "4", name: "Enterprise", priceIdr: 10000000, priceUsd: 650, features: ["Custom App", "Dedicated Server", "24/7 Support"] }
  ],
  portfolio: [
    { id: "1", title: "TechCorp Redesign", category: "Company Profile", img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800" },
    { id: "2", title: "Burger House", category: "Website Restoran", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800" },
    { id: "3", title: "Bali Travel", category: "Website Travel", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" }
  ],
  orders: [] as any[],
  tickets: [] as any[],
  chats: [] as any[],
  notifications: [] as any[],
  quotes: [] as any[],
  consultations: [] as any[],
  admins: [] as any[],
  settings: {
    qrisUrl: "https://i.imgur.com/6zYJtE2.png",
    exchangeRate: 15500,
    autoCalculateUsd: true,
    usdEnabled: true,
    idrEnabled: true
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  // Helper to test if DB is connected
  async function checkDbConnected() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // --- ADMIN AUTH API ---
  app.get("/api/admin/check", async (req, res) => {
    try {
      const isConnected = await checkDbConnected();
      if (isConnected) {
        const count = await prisma.admin.count();
        return res.json({ hasAdmin: count > 0 });
      } else {
        return res.json({ hasAdmin: mockDb.admins.length > 0 });
      }
    } catch (err) {
      return res.json({ hasAdmin: mockDb.admins.length > 0 });
    }
  });

  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { name, username, email, password } = req.body;
      if (!name || !username || !email || !password) {
        return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const isConnected = await checkDbConnected();

      let adminData: any;

      if (isConnected) {
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
      
      // Set HTTP-Only Cookie
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

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
      }

      const isConnected = await checkDbConnected();
      let admin: any = null;

      if (isConnected) {
        admin = await prisma.admin.findFirst({
          where: { OR: [{ username }, { email: username }] }
        });
      } else {
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

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.json({ success: true });
  });

  app.get("/api/admin/me", async (req, res) => {
    try {
      const token = req.cookies?.admin_token || req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ success: false });

      const decoded: any = jwt.verify(token, JWT_SECRET);
      const isConnected = await checkDbConnected();

      if (isConnected) {
        const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
        if (!admin) return res.status(404).json({ success: false });
        return res.json({ success: true, admin: { id: admin.id, name: admin.name, username: admin.username, email: admin.email, role: admin.role } });
      } else {
        const admin = mockDb.admins.find(a => a.id === decoded.id);
        if (!admin) return res.status(404).json({ success: false });
        return res.json({ success: true, admin });
      }
    } catch (err) {
      return res.status(401).json({ success: false });
    }
  });

  // --- PUBLIC & OPERATIONAL APIs ---
  app.get("/api/services", async (req, res) => {
    try {
      if (await checkDbConnected()) {
        const services = await prisma.service.findMany();
        if (services.length > 0) return res.json(services);
      }
      res.json(mockDb.services);
    } catch {
      res.json(mockDb.services);
    }
  });

  app.get("/api/pricing", (req, res) => res.json(mockDb.pricing));
  
  app.get("/api/portfolio", async (req, res) => {
    try {
      if (await checkDbConnected()) {
        const items = await prisma.portfolio.findMany();
        if (items.length > 0) return res.json(items);
      }
      res.json(mockDb.portfolio);
    } catch {
      res.json(mockDb.portfolio);
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      if (await checkDbConnected()) {
        const s = await prisma.settings.findUnique({ where: { key: "general" } });
        if (s) return res.json(JSON.parse(s.value));
      }
      res.json(mockDb.settings);
    } catch {
      res.json(mockDb.settings);
    }
  });

  app.put("/api/admin/settings", async (req, res) => {
    try {
      mockDb.settings = { ...mockDb.settings, ...req.body };
      if (await checkDbConnected()) {
        await prisma.settings.upsert({
          where: { key: "general" },
          update: { value: JSON.stringify(mockDb.settings) },
          create: { key: "general", value: JSON.stringify(mockDb.settings) }
        });
      }
      res.json({ success: true, settings: mockDb.settings });
    } catch (err) {
      res.json({ success: true, settings: mockDb.settings });
    }
  });

  // Orders (Support both /api/orders and /api/order)
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
      mockDb.notifications.push({
        id: Date.now().toString(),
        title: "Pesanan Dibuat",
        message: `Pesanan ${orderNo} berhasil dibuat. Silakan lakukan pembayaran.`,
        date: new Date().toISOString(),
        read: false
      });

      if (await checkDbConnected()) {
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
            history: [{ status: "Menunggu Pembayaran", date: new Date().toISOString() }]
          }
        });
      }

      res.json({ success: true, order: newOrder });
    } catch (err) {
      console.error("Order creation error:", err);
      res.status(500).json({ success: false });
    }
  };

  app.post("/api/orders", handleCreateOrder);
  app.post("/api/order", handleCreateOrder);

  app.post("/api/orders/:id/payment", async (req, res) => {
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
        const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
        if (orders.length > 0) return res.json(orders);
      }
      res.json(mockDb.orders);
    } catch {
      res.json(mockDb.orders);
    }
  };

  app.get("/api/my-orders", handleGetOrders);
  app.get("/api/order", handleGetOrders);
  app.get("/api/orders", handleGetOrders);

  app.get("/api/orders/:id", (req, res) => {
    const order = mockDb.orders.find(o => o.id === req.params.id || o.orderNo === req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json(order);
  });

  // Admin Orders / PATCH /api/order/:id
  const handleUpdateOrderAdmin = async (req: any, res: any) => {
    const orderId = req.params.id;
    const orderIndex = mockDb.orders.findIndex(o => o.id === orderId || o.orderNo === orderId);
    
    if (orderIndex !== -1) {
      const oldStatus = mockDb.orders[orderIndex].status;
      mockDb.orders[orderIndex] = { ...mockDb.orders[orderIndex], ...req.body };
      if (req.body.status && req.body.status !== oldStatus) {
        mockDb.orders[orderIndex].history = mockDb.orders[orderIndex].history || [];
        mockDb.orders[orderIndex].history.push({ status: req.body.status, date: new Date().toISOString() });
        mockDb.notifications.push({
          id: Date.now().toString(),
          title: "Status Pesanan Berubah",
          message: `Status pesanan ${mockDb.orders[orderIndex].orderNo} berubah menjadi ${req.body.status}.`,
          date: new Date().toISOString(),
          read: false
        });
      }
    }

    try {
      if (await checkDbConnected()) {
        await prisma.order.updateMany({
          where: { OR: [{ id: orderId }, { orderNo: orderId }] },
          data: {
            status: req.body.status,
            progress: req.body.progress,
            notes: req.body.notes
          }
        });
      }
    } catch {}

    res.json({ success: true });
  };

  app.put("/api/admin/orders/:id", handleUpdateOrderAdmin);
  app.patch("/api/order/:id", handleUpdateOrderAdmin);

  app.get("/api/admin/orders", async (req, res) => {
    try {
      if (await checkDbConnected()) {
        const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
        if (orders.length > 0) return res.json(orders);
      }
      res.json(mockDb.orders);
    } catch {
      res.json(mockDb.orders);
    }
  });

  // Notifications
  app.get("/api/notifications", (req, res) => res.json(mockDb.notifications));
  app.post("/api/notifications/read", (req, res) => {
    mockDb.notifications.forEach(n => n.read = true);
    res.json({ success: true });
  });

  // Support Tickets (Support both /api/tickets and /api/support)
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
      }
    } catch {}

    res.json({ success: true, ticket });
  };

  app.post("/api/tickets", handleCreateTicket);
  app.post("/api/support", handleCreateTicket);

  const handleGetTickets = async (req: any, res: any) => {
    try {
      if (await checkDbConnected()) {
        const list = await prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } });
        if (list.length > 0) return res.json(list);
      }
      res.json(mockDb.tickets);
    } catch {
      res.json(mockDb.tickets);
    }
  };

  app.get("/api/tickets", handleGetTickets);
  app.get("/api/support", handleGetTickets);
  app.get("/api/admin/tickets", handleGetTickets);

  app.put("/api/admin/tickets/:id", (req, res) => {
    const t = mockDb.tickets.find(tk => tk.id === req.params.id || tk.ticketNo === req.params.id);
    if (!t) return res.status(404).json({ success: false });
    Object.assign(t, req.body);
    res.json({ success: true, ticket: t });
  });

  // Quotes
  app.post("/api/quotes", (req, res) => {
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

  app.get("/api/admin/quotes", (req, res) => res.json(mockDb.quotes));
  app.put("/api/admin/quotes/:id", (req, res) => {
    const q = mockDb.quotes.find(item => item.id === req.params.id || item.quoteNo === req.params.id);
    if (!q) return res.status(404).json({ success: false });
    Object.assign(q, req.body);
    res.json({ success: true, quote: q });
  });

  // Consultations
  app.post("/api/consultations", (req, res) => {
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

  app.get("/api/admin/consultations", (req, res) => res.json(mockDb.consultations));
  app.put("/api/admin/consultations/:id", (req, res) => {
    const c = mockDb.consultations.find(item => item.id === req.params.id || item.consultationNo === req.params.id);
    if (!c) return res.status(404).json({ success: false });
    Object.assign(c, req.body);
    res.json({ success: true, consultation: c });
  });

  // Chat System with Gemini AI
  let aiClient: GoogleGenAI | null = null;
  app.post("/api/chat", async (req, res) => {
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

  app.get("/api/chat/:sessionId", (req, res) => {
    const session = mockDb.chats.find(c => c.sessionId === req.params.sessionId);
    res.json(session || { messages: [], adminTakingOver: false });
  });

  app.get("/api/chat", (req, res) => {
    res.json(mockDb.chats);
  });

  app.get("/api/admin/chats", (req, res) => res.json(mockDb.chats));

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
