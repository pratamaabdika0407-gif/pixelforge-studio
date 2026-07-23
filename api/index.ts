import { Router } from "express";
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

// --- SERVICES & PORTFOLIO & SETTINGS ---
router.get("/services", async (req, res) => {
  try {
    if (await checkDbConnected()) {
      try {
        const services = await prisma.service.findMany();
        if (services.length > 0) return res.json(services);
      } catch {}
    }
    res.json(mockDb.services);
  } catch {
    res.json(mockDb.services);
  }
});

router.get("/pricing", (req, res) => res.json(mockDb.pricing));

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

// --- ORDERS ---
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

// --- NOTIFICATIONS ---
router.get("/notifications", (req, res) => res.json(mockDb.notifications));
router.post("/notifications/read", (req, res) => {
  mockDb.notifications.forEach(n => n.read = true);
  res.json({ success: true });
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

router.get("/admin/quotes", (req, res) => res.json(mockDb.quotes));
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

router.get("/admin/consultations", (req, res) => res.json(mockDb.consultations));
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

router.get("/admin/chats", (req, res) => res.json(mockDb.chats));

export default router;
