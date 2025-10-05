import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    nav_features: 'Features',
    nav_pricing: 'Pricing',
    nav_about: 'About Us',
    nav_login: 'Login',
    nav_signup: 'Sign Up',
    hero_title: 'Your All-in-One Career Co-Pilot',
    hero_subtitle: 'From Graduation to Dream Job',
    hero_description: 'CareerMate empowers Indonesian graduates and young professionals with AI-powered tools to build CVs, practice interviews, find jobs, and manage their career journey—all in one platform.',
    hero_cta: 'Start Building Your Future for Free',
    problem_title: 'The Challenge Graduates Face',
    problem_description: 'Fresh graduates struggle with creating professional CVs, preparing for interviews, finding the right jobs, and managing career documents—all while competing in a tough job market.',
    solution_title: 'Your Complete Career Solution',
    solution_description: 'CareerMate brings together everything you need in one intelligent platform, powered by AI to give you a competitive edge.',
    features_title: 'Powerful Features to Accelerate Your Career',
    cvmate_title: 'CVMate',
    cvmate_description: 'AI-powered CV and resume builder with ATS optimization and professional templates',
    jobmate_title: 'JobMate',
    jobmate_description: 'Smart job matching platform that connects you with opportunities tailored to your profile',
    interviewmate_title: 'InterviewMate',
    interviewmate_description: 'AI interview simulator to practice and perfect your interview skills with real-time feedback',
    documate_title: 'DocuMate',
    documate_description: 'Secure cloud storage for all your career documents, accessible anywhere, anytime',
    insightmate_title: 'InsightMate',
    insightmate_description: 'Market insights on in-demand skills, salary expectations, and career trends',
    pricing_title: 'Simple, Transparent Pricing',
    pricing_free: 'Free Forever',
    pricing_premium: 'Premium',
    pricing_free_price: '$0',
    pricing_premium_price: '$9.99',
    pricing_per_month: '/month',
    pricing_cta_free: 'Get Started',
    pricing_cta_premium: 'Upgrade Now',
    testimonials_title: 'Success Stories from Our Users',
    cta_title: 'Ready to Launch Your Career?',
    cta_description: 'Join thousands of Indonesian professionals who are building their dream careers with CareerMate',
    cta_button: 'Start Your Free Account',
    footer_tagline: 'Your trusted career companion',
    footer_product: 'Product',
    footer_company: 'Company',
    footer_support: 'Support',
    footer_legal: 'Legal',
  },
  id: {
    nav_features: 'Fitur',
    nav_pricing: 'Harga',
    nav_about: 'Tentang Kami',
    nav_login: 'Masuk',
    nav_signup: 'Daftar',
    hero_title: 'Asisten Karir Lengkap Anda',
    hero_subtitle: 'Dari Lulus Hingga Pekerjaan Impian',
    hero_description: 'CareerMate memberdayakan lulusan dan profesional muda Indonesia dengan alat bertenaga AI untuk membangun CV, berlatih wawancara, mencari pekerjaan, dan mengelola perjalanan karir—semua dalam satu platform.',
    hero_cta: 'Mulai Bangun Masa Depan Anda Gratis',
    problem_title: 'Tantangan yang Dihadapi Lulusan',
    problem_description: 'Lulusan baru kesulitan membuat CV profesional, mempersiapkan wawancara, menemukan pekerjaan yang tepat, dan mengelola dokumen karir—sambil bersaing di pasar kerja yang kompetitif.',
    solution_title: 'Solusi Karir Lengkap Anda',
    solution_description: 'CareerMate menyatukan semua yang Anda butuhkan dalam satu platform cerdas, didukung AI untuk memberi Anda keunggulan kompetitif.',
    features_title: 'Fitur Powerful untuk Mempercepat Karir Anda',
    cvmate_title: 'CVMate',
    cvmate_description: 'Pembuat CV dan resume bertenaga AI dengan optimasi ATS dan template profesional',
    jobmate_title: 'JobMate',
    jobmate_description: 'Platform pencarian kerja pintar yang menghubungkan Anda dengan peluang sesuai profil Anda',
    interviewmate_title: 'InterviewMate',
    interviewmate_description: 'Simulator wawancara AI untuk berlatih dan menyempurnakan keterampilan wawancara dengan umpan balik real-time',
    documate_title: 'DocuMate',
    documate_description: 'Penyimpanan cloud aman untuk semua dokumen karir Anda, dapat diakses kapan saja, di mana saja',
    insightmate_title: 'InsightMate',
    insightmate_description: 'Wawasan pasar tentang keterampilan yang diminati, ekspektasi gaji, dan tren karir',
    pricing_title: 'Harga yang Sederhana dan Transparan',
    pricing_free: 'Gratis Selamanya',
    pricing_premium: 'Premium',
    pricing_free_price: '$0',
    pricing_premium_price: '$9.99',
    pricing_per_month: '/bulan',
    pricing_cta_free: 'Mulai Sekarang',
    pricing_cta_premium: 'Upgrade Sekarang',
    testimonials_title: 'Kisah Sukses dari Pengguna Kami',
    cta_title: 'Siap Meluncurkan Karir Anda?',
    cta_description: 'Bergabunglah dengan ribuan profesional Indonesia yang membangun karir impian mereka dengan CareerMate',
    cta_button: 'Buat Akun Gratis',
    footer_tagline: 'Pendamping karir terpercaya Anda',
    footer_product: 'Produk',
    footer_company: 'Perusahaan',
    footer_support: 'Dukungan',
    footer_legal: 'Legal',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language;
    return stored || 'en';
  });

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
