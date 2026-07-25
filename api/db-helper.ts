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
    { id: "1", title: "Landing Page", desc: "One-page website for promotions and campaigns.", priceIdr: 299000, priceUsd: 25, features: ["Responsive", "Fast", "SEO Basic"], eta: "3–5 Hari Kerja", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", badge: "Terlaris" },
    { id: "2", title: "Company Profile", desc: "Professional web for corporate businesses.", priceIdr: 699000, priceUsd: 55, features: ["5 Pages", "CMS", "SEO Optimized"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800", badge: "Populer" },
    { id: "3", title: "Website Portfolio", desc: "Showcase your best creative work or resume.", priceIdr: 499000, priceUsd: 40, features: ["Gallery", "Responsive", "Fast"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800" },
    { id: "4", title: "Website Blog", desc: "Personal or professional blog & content hub.", priceIdr: 799000, priceUsd: 65, features: ["CMS", "Comments", "SEO"], eta: "5–7 Hari Kerja", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800" },
    { id: "5", title: "Website UMKM", desc: "Digitalize your local business or store.", priceIdr: 999000, priceUsd: 80, features: ["Catalog", "WhatsApp Order", "Fast"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800", badge: "Terlaris" },
    { id: "6", title: "Website Restoran", desc: "Online menu & table reservations.", priceIdr: 1499000, priceUsd: 120, features: ["Menu List", "Order System", "Map"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" },
    { id: "7", title: "Website Cafe", desc: "Cozy cafe catalog and review site.", priceIdr: 1499000, priceUsd: 120, features: ["Menu List", "Instagram Feed", "Map"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800" },
    { id: "8", title: "Website Barbershop", desc: "Booking system for barbershops.", priceIdr: 1199000, priceUsd: 95, features: ["Booking Form", "Services", "Staff"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" },
    { id: "9", title: "Website Salon", desc: "Salon beauty services & appointment booking.", priceIdr: 1199000, priceUsd: 95, features: ["Booking Form", "Treatment List", "Gallery"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" },
    { id: "10", title: "Website Toko Online", desc: "E-commerce store with cart & checkout.", priceIdr: 2499000, priceUsd: 180, features: ["Cart", "Checkout", "Payment Gateway"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800", badge: "Populer" },
    { id: "11", title: "Website Marketplace", desc: "Multi-vendor online marketplace platform.", priceIdr: 5999000, priceUsd: 450, features: ["Multi-Vendor", "Dashboard", "Commissions"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800", badge: "Premium" },
    { id: "12", title: "Website Travel", desc: "Tour booking and destination packages.", priceIdr: 1999000, priceUsd: 150, features: ["Destinations", "Booking", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" },
    { id: "13", title: "Website Hotel", desc: "Hotel room booking & reservation system.", priceIdr: 2990000, priceUsd: 220, features: ["Room Booking", "Calendar", "Amenities"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" },
    { id: "14", title: "Website Villa", desc: "Luxury villa rental & direct booking portal.", priceIdr: 2499000, priceUsd: 180, features: ["Villa Catalog", "Booking Engine", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800" },
    { id: "15", title: "Website Rental Mobil", desc: "Car rental catalog and booking schedule.", priceIdr: 2499000, priceUsd: 180, features: ["Car Catalog", "Rental Dates", "WhatsApp"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800" },
    { id: "16", title: "Website Rental Motor", desc: "Motorcycle rental booking system.", priceIdr: 1999000, priceUsd: 150, features: ["Bike List", "Daily Rates", "Booking"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800" },
    { id: "17", title: "Website Properti", desc: "Real estate property listings and agent portal.", priceIdr: 2990000, priceUsd: 220, features: ["Property Search", "Map", "Agent Profile"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" },
    { id: "18", title: "Website Klinik", desc: "Healthcare appointments and doctor schedules.", priceIdr: 2499000, priceUsd: 180, features: ["Doctor Schedule", "Appointments", "Services"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800" },
    { id: "19", title: "Website Rumah Sakit", desc: "Comprehensive hospital portal & medical services.", priceIdr: 4999000, priceUsd: 350, features: ["ER Info", "Doctors", "Patient Portal"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800", badge: "Premium" },
    { id: "20", title: "Website Sekolah", desc: "Information portal for schools and education.", priceIdr: 2990000, priceUsd: 220, features: ["E-Learning", "Announcements", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800" },
    { id: "21", title: "Website Universitas", desc: "Campus portal with faculties & student directory.", priceIdr: 5999000, priceUsd: 450, features: ["Faculties", "Portal", "Research"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800", badge: "Premium" },
    { id: "22", title: "Website Kursus", desc: "Online course selling and tutoring platform.", priceIdr: 1999000, priceUsd: 150, features: ["Course List", "Lessons", "Student Area"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" },
    { id: "23", title: "Website Digital Marketing", desc: "Agency landing page for marketing services.", priceIdr: 1499000, priceUsd: 120, features: ["Case Studies", "Pricing", "Lead Form"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800" },
    { id: "24", title: "Website SEO Agency", desc: "Professional SEO service promotion site.", priceIdr: 1999000, priceUsd: 150, features: ["Audit Form", "Pricing", "Blog"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1572177812156-58036aae439c?auto=format&fit=crop&q=80&w=800" },
    { id: "25", title: "Website Photography", desc: "Portfolio and session booking for photographers.", priceIdr: 1499000, priceUsd: 120, features: ["Portfolio Grid", "Booking", "Pricing"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800" },
    { id: "26", title: "Website Videography", desc: "Showcase cinematic reels and video productions.", priceIdr: 1499000, priceUsd: 120, features: ["Video Embeds", "Reels", "Contact"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800" },
    { id: "27", title: "Website Percetakan", desc: "Printing service catalog and order uploader.", priceIdr: 1299000, priceUsd: 95, features: ["Product Catalog", "File Upload", "Pricing"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80&w=800" },
    { id: "28", title: "Website Bengkel", desc: "Automotive repair shop service booking.", priceIdr: 1299000, priceUsd: 95, features: ["Service List", "Booking", "Location"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800" },
    { id: "29", title: "Website Dealer Mobil", desc: "Car showroom and vehicle specs catalog.", priceIdr: 2990000, priceUsd: 220, features: ["Car Specs", "Test Drive Form", "Gallery"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800" },
    { id: "30", title: "Website Dealer Motor", desc: "Motorcycle showroom and credit calculator.", priceIdr: 2499000, priceUsd: 180, features: ["Bike Specs", "Credit Calculator", "WhatsApp"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800" },
    { id: "31", title: "Website Gym", desc: "Fitness center membership & class schedule.", priceIdr: 1499000, priceUsd: 120, features: ["Class Timetable", "Trainer List", "Pricing"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" },
    { id: "32", title: "Website Komunitas", desc: "Community hub, events, and member forum.", priceIdr: 999000, priceUsd: 80, features: ["Event Calendar", "Members", "Gallery"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800" },
    { id: "33", title: "Website Yayasan", desc: "Non-profit foundation & donation portal.", priceIdr: 1499000, priceUsd: 120, features: ["Donation Form", "Activities", "Reports"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&q=80&w=800" },
    { id: "34", title: "Website Masjid", desc: "Mosque info, prayer times, and donations.", priceIdr: 1299000, priceUsd: 95, features: ["Prayer Times", "Activities", "Donations"], eta: "7–10 Hari Kerja", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800" },
    { id: "35", title: "Website Portal Berita", desc: "News portal with categories and trending tags.", priceIdr: 2990000, priceUsd: 220, features: ["News Categories", "Comments", "Trending"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800" },
    { id: "36", title: "Website Forum", desc: "Discussion board and community Q&A site.", priceIdr: 1999000, priceUsd: 150, features: ["Discussions", "User Profiles", "Search"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" },
    { id: "37", title: "Website Booking Online", desc: "General online appointment & scheduling app.", priceIdr: 3499000, priceUsd: 260, features: ["Slot Booking", "Calendar", "Reminders"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800" },
    { id: "38", title: "Website Membership", desc: "Exclusive member area with subscription tiers.", priceIdr: 2499000, priceUsd: 180, features: ["Member Levels", "Gate Content", "Payments"], eta: "10–14 Hari Kerja", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800" },
    { id: "39", title: "Website E-Learning", desc: "Advanced online academy with video lessons.", priceIdr: 4999000, priceUsd: 350, features: ["Video Lessons", "Quizzes", "Certificates"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800" },
    { id: "40", title: "Website SaaS", desc: "Software as a Service application platform.", priceIdr: 9999000, priceUsd: 700, features: ["Dashboard", "Billing", "User Roles"], eta: "21 Hari Kerja", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800", badge: "Premium" },
    { id: "41", title: "Website Startup", desc: "High-impact startup launch landing & portal.", priceIdr: 7999000, priceUsd: 550, features: ["Pitch Deck", "Waitlist", "Modern UI"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800", badge: "Premium" },
    { id: "42", title: "Website AI", desc: "AI tool integration or AI SaaS platform.", priceIdr: 9999000, priceUsd: 700, features: ["AI Integration", "API Backend", "Dashboard"], eta: "21 Hari Kerja", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800", badge: "Premium" },
    { id: "43", title: "Website Crypto", desc: "Cryptocurrency token or project web platform.", priceIdr: 12999000, priceUsd: 900, features: ["Tokenomics", "Wallet Connect", "Roadmap"], eta: "21 Hari Kerja", img: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=800", badge: "Premium" },
    { id: "44", title: "Website Trading", desc: "Financial trading and market analysis web.", priceIdr: 5999000, priceUsd: 450, features: ["Charts", "Live Rates", "Signals"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800" },
    { id: "45", title: "Website PPOB", desc: "Payment point online bank & biller web.", priceIdr: 4999000, priceUsd: 350, features: ["Bill Payments", "Transactions", "API"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800" },
    { id: "46", title: "Website Top Up Game", desc: "Game voucher top-up and digital store.", priceIdr: 4999000, priceUsd: 350, features: ["Voucher Catalog", "Instant Pay", "API"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" },
    { id: "47", title: "Website Hosting Provider", desc: "Cloud hosting and domain reseller platform.", priceIdr: 6999000, priceUsd: 500, features: ["WHMCS Integration", "Plans", "Support"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800" },
    { id: "48", title: "Website Domain Provider", desc: "Domain registration and search portal.", priceIdr: 4999000, priceUsd: 350, features: ["Whois Search", "Cart", "Registrar API"], eta: "14–21 Hari Kerja", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800" },
    { id: "49", title: "Website Custom", desc: "Tailored to your specific business requirements.", priceIdr: 3500000, priceUsd: 250, features: ["Custom Logic", "API Integrations", "Advanced UI"], eta: "Estimasi berdasarkan kebutuhan proyek", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" }
  ],
  pricing: [
    { id: "1", name: "Starter", priceIdr: 299000, priceUsd: 25, price_idr: 299000, price_usd: 25, features: ["1 Page", "Shared Hosting", "Basic SEO"] },
    { id: "2", name: "Professional", priceIdr: 699000, priceUsd: 55, price_idr: 699000, price_usd: 55, features: ["5 Pages", "Free Domain", "Premium Support"] },
    { id: "3", name: "Business", priceIdr: 1499000, priceUsd: 120, price_idr: 1499000, price_usd: 120, features: ["10 Pages", "Advanced SEO", "Custom Design"] },
    { id: "4", name: "Enterprise", priceIdr: 2999000, priceUsd: 250, price_idr: 2999000, price_usd: 250, features: ["Custom App", "Dedicated Server", "24/7 Support"] }
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
  notificationLogs: [] as any[],
  activityLogs: [] as any[],
  quotes: [] as any[],
  consultations: [] as any[],
  admins: [] as any[],
  settings: {
    qrisUrl: "https://i.imgur.com/6zYJtE2.png",
    exchangeRate: 15500,
    autoCalculateUsd: true,
    usdEnabled: true,
    idrEnabled: true,
    promoActive: false,
    discountPercent: 0,
    promoTitle: ""
  }
};
