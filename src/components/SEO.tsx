import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SEO() {
  const { lang, t } = useLanguage();

  useEffect(() => {
    // Basic translations
    const title = lang === 'en' ? 'PixelForge Studio | Digital Agency' : 'PixelForge Studio | Agensi Digital';
    const description = lang === 'en' 
      ? 'We create premium websites, powerful apps, and digital experiences that elevate your brand to the next level.'
      : 'Kami membuat website premium, aplikasi tangguh, dan pengalaman digital yang meningkatkan brand Anda ke level berikutnya.';
    const keywords = lang === 'en'
      ? 'web development, digital agency, website builder'
      : 'pembuatan website, agensi digital, jasa website';
      
    document.title = title;
    
    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    // HTML Lang
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
