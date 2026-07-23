import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const JWT_SECRET = process.env.JWT_SECRET || "pixelforge-super-secret-jwt-key-2026";

export async function checkDbConnected() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export const mockDb = {
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
