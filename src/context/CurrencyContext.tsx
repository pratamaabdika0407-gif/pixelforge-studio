import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'IDR' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRate: number;
  autoCalculateUsd: boolean;
  usdEnabled: boolean;
  idrEnabled: boolean;
  formatPrice: (priceIdr: number, priceUsd?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('IDR');
  const [exchangeRate, setExchangeRate] = useState(15500);
  const [autoCalculateUsd, setAutoCalculateUsd] = useState(true);
  const [usdEnabled, setUsdEnabled] = useState(true);
  const [idrEnabled, setIdrEnabled] = useState(true);

  // Initialize currency from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('currency') as Currency;
    if (saved && (saved === 'IDR' || saved === 'USD')) {
      setCurrencyState(saved);
    }
  }, []);

  // Fetch settings from server
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.exchangeRate) setExchangeRate(data.exchangeRate);
        if (data.autoCalculateUsd !== undefined) setAutoCalculateUsd(data.autoCalculateUsd);
        if (data.usdEnabled !== undefined) setUsdEnabled(data.usdEnabled);
        if (data.idrEnabled !== undefined) setIdrEnabled(data.idrEnabled);
      })
      .catch(console.error);

    // Try to get real exchange rate
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data.rates && data.rates.IDR) {
          setExchangeRate(data.rates.IDR);
        }
      })
      .catch(console.error);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
  };

  const formatPrice = (priceIdr: number, priceUsd?: number) => {
    const validIdr = typeof priceIdr === 'number' && !isNaN(priceIdr) ? priceIdr : 0;
    const validRate = typeof exchangeRate === 'number' && exchangeRate > 0 ? exchangeRate : 15500;
    if (currency === 'IDR' || !usdEnabled) {
      return `Rp ${validIdr.toLocaleString('id-ID')}`;
    } else {
      const finalUsd = autoCalculateUsd ? (validIdr / validRate) : (priceUsd || (validIdr / validRate));
      const validUsd = typeof finalUsd === 'number' && !isNaN(finalUsd) ? finalUsd : 0;
      return `$${validUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, autoCalculateUsd, usdEnabled, idrEnabled, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};
