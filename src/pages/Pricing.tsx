import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { useCurrency } from "../context/CurrencyContext";

export default function Pricing() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetch("/api/pricing")
      .then(res => res.json())
      .then(data => {
        setPricing(data);
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
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">Transparent Pricing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your business needs. No hidden fees.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {pricing.map((plan: any, i: number) => {
            const isPopular = plan.name === "Business";
            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={clsx(
                  "relative rounded-3xl p-8 border flex flex-col",
                  isPopular 
                    ? "bg-gradient-to-b from-gray-900 to-black text-white border-neon-purple shadow-[0_0_30px_rgba(192,38,211,0.2)]" 
                    : "bg-white dark:bg-[#111111] border-gray-200 dark:border-white/10"
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-neon-purple text-white text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className={clsx("text-xl font-bold mb-4", isPopular ? "text-white" : "text-gray-900 dark:text-white")}>{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{formatPrice(plan.price_idr, plan.price_usd)}</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feat: string, j: number) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className={clsx("w-5 h-5 shrink-0", isPopular ? "text-accent-blue" : "text-neon-purple")} />
                      <span className={clsx("text-sm", isPopular ? "text-gray-300" : "text-gray-600 dark:text-gray-400")}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to={`/order?plan=${plan.id}`}
                  className={clsx(
                    "w-full py-4 rounded-xl font-medium text-center transition-all flex items-center justify-center gap-2",
                    isPopular
                      ? "bg-gradient-to-r from-accent-blue to-neon-purple text-white hover:opacity-90"
                      : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
                  )}
                >
                  Choose Plan <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
