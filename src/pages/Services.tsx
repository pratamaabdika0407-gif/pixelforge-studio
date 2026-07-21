import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">Our Services</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comprehensive digital solutions tailored to your specific business needs. From simple landing pages to complex web applications.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any, i: number) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#111111] hover:border-accent-blue/50 transition-colors"
            >
              <div className="h-48 overflow-hidden">
                <img src={service.img} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{service.desc}</p>
                
                <div className="text-2xl font-bold mb-6 text-neon-purple">
                  {formatPrice(service.price_idr, service.price_usd)}
                </div>
                
                <div className="space-y-3 mb-8 flex-grow">
                  {service.features.map((feat: string, j: number) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100 dark:border-white/5">
                    <span className="font-medium">ETA:</span> {service.eta}
                  </div>
                </div>

                <Link 
                  to={`/order?service=${service.id}`}
                  className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-medium text-center transition-colors"
                >
                  Order This Service
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
