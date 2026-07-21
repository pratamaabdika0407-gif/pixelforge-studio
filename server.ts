import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Mock Database (In-Memory)
const db = {
  services: [
    { id: 1, title: "Landing Page", desc: "One-page website for promotions.", price_idr: 500000, price_usd: 35, features: ["Responsive", "Fast", "SEO Basic"], eta: "3–5 Hari Kerja", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "Company Profile", desc: "Professional web for businesses.", price_idr: 1500000, price_usd: 100, features: ["5 Pages", "CMS", "SEO Optimized"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "Website Portofolio", desc: "Showcase your best work.", price_idr: 1000000, price_usd: 70, features: ["Gallery", "Responsive", "Fast"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800" },
    { id: 4, title: "Website UMKM", desc: "Digitalize your local business.", price_idr: 1000000, price_usd: 70, features: ["Catalog", "WhatsApp Order", "Fast"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" },
    { id: 5, title: "Website Restoran", desc: "Online menu & reservations.", price_idr: 1200000, price_usd: 85, features: ["Menu List", "Order System", "Map"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" },
    { id: 6, title: "Website Barbershop", desc: "Booking system for barbershops.", price_idr: 1200000, price_usd: 85, features: ["Booking Form", "Services", "Staff"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" },
    { id: 7, title: "Blog", desc: "Share your stories.", price_idr: 800000, price_usd: 55, features: ["CMS", "Comments", "SEO"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800" },
    { id: 8, title: "Website Sekolah", desc: "Information portal for schools.", price_idr: 2500000, price_usd: 175, features: ["E-Learning", "Announcements", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800" },
    { id: 9, title: "Website Klinik", desc: "Healthcare appointments.", price_idr: 2500000, price_usd: 175, features: ["Appointments", "Services", "Doctors"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800" },
    { id: 10, title: "Website Travel", desc: "Tour booking and destinations.", price_idr: 2500000, price_usd: 175, features: ["Destinations", "Booking", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" },
    { id: 11, title: "Website Properti", desc: "Real estate listings.", price_idr: 3000000, price_usd: 200, features: ["Listings", "Search", "Map"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" },
    { id: 12, title: "Website Rental", desc: "Rent cars, bikes, or equipment.", price_idr: 3000000, price_usd: 200, features: ["Booking System", "Inventory", "Payments"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800" },
    { id: 13, title: "Website Custom", desc: "Tailored to your specific needs.", price_idr: 5000000, price_usd: 350, features: ["Custom Logic", "API Integrations", "Advanced UI"], eta: "Estimasi berdasarkan kebutuhan proyek", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" }
  ],
  pricing: [
    { id: 1, name: "Starter", price_idr: 500000, price_usd: 35, features: ["1 Page", "Shared Hosting", "Basic SEO"] },
    { id: 2, name: "Professional", price_idr: 1500000, price_usd: 100, features: ["5 Pages", "Free Domain", "Premium Support"] },
    { id: 3, name: "Business", price_idr: 3000000, price_usd: 200, features: ["10 Pages", "Advanced SEO", "Custom Design"] },
    { id: 4, name: "Enterprise", price_idr: 10000000, price_usd: 650, features: ["Custom App", "Dedicated Server", "24/7 Support"] }
  ],
  portfolio: [
    { id: 1, title: "TechCorp Redesign", category: "Company Profile", img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "Burger House", category: "Website Restoran", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "Bali Travel", category: "Website Travel", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" }
  ],
  orders: [] as any[],
  tickets: [] as any[],
  chats: [] as any[],
  notifications: [] as any[],
  quotes: [] as any[],
  consultations: [] as any[],
  settings: {
    qrisUrl: "https://i.imgur.com/6zYJtE2.png", // Updated to requested QRIS
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

  // API Routes
  app.get("/api/services", (req, res) => res.json(db.services));
  app.get("/api/pricing", (req, res) => res.json(db.pricing));
  app.get("/api/portfolio", (req, res) => res.json(db.portfolio));
  app.get("/api/settings", (req, res) => res.json(db.settings));
  
  // Create Order
  app.post("/api/orders", (req, res) => {
    const newOrder = { 
      id: Date.now(), 
      orderNo: `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      ...req.body, 
      status: "Menunggu Pembayaran",
      proofUrl: null,
      notes: "",
      history: [{ status: "Menunggu Pembayaran", date: new Date().toISOString() }],
      progress: 0
    };
    db.orders.push(newOrder);
    
    // Add Notification
    db.notifications.push({
      id: Date.now(),
      title: "Pesanan Dibuat",
      message: `Pesanan ${newOrder.orderNo} berhasil dibuat. Silakan lakukan pembayaran.`,
      date: new Date().toISOString(),
      read: false
    });
    
    res.json({ success: true, order: newOrder });
  });

  // Upload Payment Proof & Update Status
  app.post("/api/orders/:id/payment", (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.proofUrl = req.body.proofUrl;
    order.status = "Menunggu Verifikasi";
    order.history = order.history || [];
    order.history.push({ status: "Menunggu Verifikasi", date: new Date().toISOString() });
    
    db.notifications.push({
      id: Date.now(),
      title: "Pembayaran Diterima",
      message: `Bukti pembayaran pesanan ${order.orderNo} telah kami terima dan sedang diverifikasi.`,
      date: new Date().toISOString(),
      read: false
    });
    
    res.json({ success: true, order });
  });

  // Get all orders for current user (simulated by email)
  app.get("/api/my-orders", (req, res) => {
    const email = req.query.email;
    if (!email) return res.json([]);
    const myOrders = db.orders.filter(o => o.email === email);
    res.json(myOrders);
  });

  // Get order status
  app.get("/api/orders/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = db.orders.find(o => o.id === orderId || o.orderNo === req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json(order);
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    res.json(db.notifications);
  });
  app.post("/api/notifications/read", (req, res) => {
    db.notifications.forEach(n => n.read = true);
    res.json({ success: true });
  });

  // Support Tickets (Pengaduan)
  app.post("/api/tickets", (req, res) => {
    const ticket = {
      id: Date.now(),
      ticketNo: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: "Menunggu",
      ...req.body
    };
    db.tickets.push(ticket);
    res.json({ success: true, ticket });
  });
  
  app.get("/api/tickets", (req, res) => res.json(db.tickets));
  app.get("/api/admin/tickets", (req, res) => res.json(db.tickets));
  app.put("/api/admin/tickets/:id", (req, res) => {
    const ticketIndex = db.tickets.findIndex(t => t.id === parseInt(req.params.id));
    if (ticketIndex === -1) return res.status(404).json({ success: false });
    db.tickets[ticketIndex] = { ...db.tickets[ticketIndex], ...req.body };
    
    if (req.body.status && req.body.status !== "Menunggu") {
      db.notifications.push({
        id: Date.now(),
        title: "Pengaduan Diperbarui",
        message: `Tiket pengaduan ${db.tickets[ticketIndex].ticketNo} telah ${req.body.status.toLowerCase()}.`,
        date: new Date().toISOString(),
        read: false
      });
    }
    
    res.json({ success: true, ticket: db.tickets[ticketIndex] });
  });

  // Chat System
  let aiClient: GoogleGenAI | null = null;
  app.post("/api/chat", async (req, res) => {
    const { sessionId, message, isAdmin, lang } = req.body;
    let session = db.chats.find(c => c.sessionId === sessionId);
    
    if (!session) {
      session = { sessionId, messages: [], adminTakingOver: false, status: "active" };
      db.chats.push(session);
    }
    
    const newMessage = {
      id: Date.now(),
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
          // Add thinking indicator message
          const history = session.messages.map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })).slice(-10); // keep last 10 messages for context
          
          const systemPrompt = `You are a helpful customer support AI for PixelForge Studio, a web development agency.
You can answer questions about:
- Pricing and plans
- ETA and process
- How to order and pay via QRIS
- Uploading payment proofs
- Services: Landing Page, Company Profile, UMKM Website
If you don't know the answer or the user asks something outside this scope, tell them you are not sure and will hand over to a human admin. Do not invent false information. Answer in ${lang === 'en' ? 'natural and professional English' : 'Bahasa Indonesia'}.`;

          const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            config: {
              systemInstruction: systemPrompt
            }
          });
          
          const aiResponseText = response.text || "Mohon maaf, saya tidak dapat merespon saat ini.";
          const needsAdmin = aiResponseText.toLowerCase().includes("admin") || aiResponseText.toLowerCase().includes("human admin") || aiResponseText.toLowerCase().includes("tidak yakin");
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: aiResponseText,
            timestamp: new Date().toISOString(),
            showContact: needsAdmin
          };
          session.messages.push(aiMessage);
          
          db.notifications.push({
            id: Date.now(),
            title: "Balasan Chat Baru",
            message: "AI Support telah membalas pesan Anda.",
            date: new Date().toISOString(),
            read: false
          });

          return res.json({ success: true, message: aiMessage });
        } else {
           const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: "Sistem AI belum dikonfigurasi. Pesan Anda akan dibalas oleh Admin kami.",
            timestamp: new Date().toISOString()
          };
          session.messages.push(aiMessage);
          return res.json({ success: true, message: aiMessage });
        }
      } catch (err) {
        console.error("AI Chat Error:", err);
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: "Mohon maaf, sistem AI sedang sibuk. Silakan tunggu balasan dari Admin kami.",
          timestamp: new Date().toISOString()
        };
        session.messages.push(aiMessage);
        return res.json({ success: true, message: aiMessage });
      }
    }
    
    res.json({ success: true });
  });

  app.get("/api/chat/:sessionId", (req, res) => {
    const session = db.chats.find(c => c.sessionId === req.params.sessionId);
    res.json(session || { messages: [], adminTakingOver: false });
  });
  
  app.get("/api/admin/chats", (req, res) => {
    res.json(db.chats);
  });


  // Admin login mock
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin123") {
      res.json({ success: true, token: "fake-jwt-token" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Admin mock routes
  app.get("/api/admin/orders", (req, res) => res.json(db.orders));

  app.put("/api/admin/orders/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return res.status(404).json({ success: false, message: "Order not found" });
    
    const oldStatus = db.orders[orderIndex].status;
    const newOrderData = { ...db.orders[orderIndex], ...req.body };
    
    // Add history if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      newOrderData.history = newOrderData.history || [];
      newOrderData.history.push({
        status: req.body.status,
        date: new Date().toISOString()
      });
      
      // Send Notification
      db.notifications.push({
        id: Date.now(),
        title: "Status Pesanan Berubah",
        message: `Status pesanan ${newOrderData.orderNo} berubah menjadi ${req.body.status}.`,
        date: new Date().toISOString(),
        read: false
      });
    }
    
    db.orders[orderIndex] = newOrderData;
    res.json({ success: true, order: db.orders[orderIndex] });
  });

  app.put("/api/admin/settings", (req, res) => {
    if (req.body.qrisUrl !== undefined) db.settings.qrisUrl = req.body.qrisUrl;
    if (req.body.exchangeRate !== undefined) db.settings.exchangeRate = req.body.exchangeRate;
    if (req.body.autoCalculateUsd !== undefined) db.settings.autoCalculateUsd = req.body.autoCalculateUsd;
    if (req.body.usdEnabled !== undefined) db.settings.usdEnabled = req.body.usdEnabled;
    if (req.body.idrEnabled !== undefined) db.settings.idrEnabled = req.body.idrEnabled;
    res.json({ success: true, settings: db.settings });
  });

  // Quotes
  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteId = Date.now();
      const quoteNo = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const { 
        name, company, email, whatsapp, country, language, 
        webType, package: pkg, pages, domain, hosting, 
        features, deadline, budget, desc 
      } = req.body;

      // Simple AI Simulation for Quote calculation since we don't have to strictly use real Gemini AI for this if not needed, but prompt asks: "AI menghitung estimasi harga."
      let basePriceIdr = 1000000;
      let basePriceUsd = 70;
      let etaStr = "5-7 Hari Kerja";
      let recommended = "Professional";

      if (webType.toLowerCase().includes("landing") || webType.toLowerCase().includes("umkm")) {
        basePriceIdr = 500000;
        basePriceUsd = 35;
        etaStr = "3-5 Hari Kerja";
        recommended = "Starter";
      } else if (webType.toLowerCase().includes("sekolah") || webType.toLowerCase().includes("klinik") || webType.toLowerCase().includes("travel")) {
        basePriceIdr = 3000000;
        basePriceUsd = 200;
        etaStr = "10-14 Hari Kerja";
        recommended = "Business";
      } else if (webType.toLowerCase().includes("custom")) {
        basePriceIdr = 10000000;
        basePriceUsd = 650;
        etaStr = "Berdasarkan Kebutuhan";
        recommended = "Enterprise";
      }

      // Add simple page multipliers
      if (pages > 5) {
        basePriceIdr += 1000000;
        basePriceUsd += 70;
      }
      
      if (domain === "Ya") {
        basePriceIdr += 150000;
        basePriceUsd += 10;
      }
      
      if (hosting === "Ya") {
        basePriceIdr += 450000;
        basePriceUsd += 30;
      }

      const quoteResult = {
        id: quoteId,
        quoteNo,
        date: new Date().toISOString(),
        request: req.body,
        result: {
          priceIdr: basePriceIdr,
          priceUsd: basePriceUsd,
          eta: etaStr,
          recommended
        },
        status: "Quote Generated"
      };

      db.quotes.push(quoteResult);
      
      db.notifications.push({
        id: Date.now(),
        title: "Penawaran Baru",
        message: `Quote baru ${quoteNo} dibuat oleh ${name}.`,
        date: new Date().toISOString(),
        read: false
      });

      res.json({ success: true, quote: quoteResult });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  });

  app.get("/api/admin/quotes", (req, res) => res.json(db.quotes));
  app.put("/api/admin/quotes/:id", (req, res) => {
    const quoteIndex = db.quotes.findIndex(q => q.id === parseInt(req.params.id));
    if (quoteIndex === -1) return res.status(404).json({ success: false });
    db.quotes[quoteIndex] = { ...db.quotes[quoteIndex], ...req.body };
    res.json({ success: true, quote: db.quotes[quoteIndex] });
  });

  // Consultations
  app.post("/api/consultations", (req, res) => {
    const consultation = {
      id: Date.now(),
      consultationNo: `CNS-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: "Menunggu",
      notes: "",
      ...req.body
    };
    db.consultations.push(consultation);

    db.notifications.push({
      id: Date.now(),
      title: "Permintaan Konsultasi",
      message: `Konsultasi baru diminta oleh ${req.body.name}.`,
      date: new Date().toISOString(),
      read: false
    });

    res.json({ success: true, consultation });
  });

  app.get("/api/admin/consultations", (req, res) => res.json(db.consultations));
  app.put("/api/admin/consultations/:id", (req, res) => {
    const idx = db.consultations.findIndex(c => c.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false });
    db.consultations[idx] = { ...db.consultations[idx], ...req.body };
    
    if (req.body.status && req.body.status !== "Menunggu") {
      db.notifications.push({
        id: Date.now(),
        title: "Status Konsultasi Diperbarui",
        message: `Konsultasi dengan ${db.consultations[idx].name} telah diperbarui menjadi: ${req.body.status}.`,
        date: new Date().toISOString(),
        read: false
      });
    }

    res.json({ success: true, consultation: db.consultations[idx] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express v4, use '*'
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
