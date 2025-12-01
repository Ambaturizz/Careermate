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
    hero_title: 'Your Career Best Mate',
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
    // CVMate Page
    cvmate_hero_title: 'Create Professional CVs that Pass ATS Screening in Minutes',
    cvmate_hero_subtitle: 'With CVMate\'s AI technology, transform your experience into CVs that attract recruiters and are optimized for Applicant Tracking Systems (ATS).',
    cvmate_hero_cta: 'Try CVMate for Free',
    cvmate_why_title: 'Why CVMate?',
    cvmate_ats_title: 'Pass ATS Screening',
    cvmate_ats_desc: 'CVMate helps create ATS-friendly CVs that get through automated screening systems.',
    cvmate_design_title: 'Professional & Creative Design',
    cvmate_design_desc: 'Choose between ATS-safe templates or more creative designs that stand out.',
    cvmate_ai_title: 'AI-Powered Guidance',
    cvmate_ai_desc: 'Get keyword suggestions and content guidance to present your best information.',
    cvmate_analytics_title: 'Advanced Analytics',
    cvmate_analytics_desc: 'Premium feature to measure your CV\'s effectiveness with detailed insights.',
    cvmate_demo_title: 'See CVMate in Action',
    cvmate_demo_subtitle: 'Interactive editor with AI-powered suggestions',
    cvmate_score_label: 'CV Strength Score',
    cvmate_templates_title: 'Choose Your Perfect Template',
    cvmate_templates_subtitle: 'Professional designs optimized for your success',
    cvmate_before_after_title: 'The CVMate Difference',
    cvmate_before_label: 'Before',
    cvmate_after_label: 'After',
    cvmate_final_cta_title: 'Ready to Start Your Dream Career?',
    cvmate_final_cta_desc: 'Create a professional CV in minutes with CVMate\'s AI-powered builder. Start for free today.',
    cvmate_final_cta_button: 'Create Your Professional CV Now',
  },
  id: {
    nav_features: 'Fitur',
    nav_pricing: 'Harga',
    nav_about: 'Tentang Kami',
    nav_login: 'Masuk',
    nav_signup: 'Daftar',
    hero_title: 'Sahabat Karir Terbaik Anda',
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
    // CVMate Page
    cvmate_hero_title: 'Buat CV Profesional yang Lolos Seleksi ATS dalam Hitungan Menit',
    cvmate_hero_subtitle: 'Dengan teknologi AI dari CVMate, ubah pengalaman Anda menjadi CV yang menarik perhatian perekrut dan dioptimalkan untuk sistem pelacakan pelamar (ATS).',
    cvmate_hero_cta: 'Coba CVMate Gratis',
    cvmate_why_title: 'Mengapa CVMate?',
    cvmate_ats_title: 'Lolos Seleksi ATS',
    cvmate_ats_desc: 'CVMate membantu membuat CV yang ATS-friendly agar lolos sistem seleksi otomatis.',
    cvmate_design_title: 'Desain Profesional & Kreatif',
    cvmate_design_desc: 'Pilih antara templat yang aman untuk ATS atau yang lebih kreatif untuk menonjol.',
    cvmate_ai_title: 'Panduan Berbasis AI',
    cvmate_ai_desc: 'Dapatkan saran kata kunci dan panduan isian untuk menyajikan informasi terbaik Anda.',
    cvmate_analytics_title: 'Analitik Tingkat Lanjut',
    cvmate_analytics_desc: 'Fitur premium untuk mengukur efektivitas CV Anda dengan wawasan mendalam.',
    cvmate_demo_title: 'Lihat CVMate Beraksi',
    cvmate_demo_subtitle: 'Editor interaktif dengan saran bertenaga AI',
    cvmate_score_label: 'Skor Kekuatan CV',
    cvmate_templates_title: 'Pilih Templat Sempurna Anda',
    cvmate_templates_subtitle: 'Desain profesional yang dioptimalkan untuk kesuksesan Anda',
    cvmate_before_after_title: 'Perbedaan dengan CVMate',
    cvmate_before_label: 'Sebelum',
    cvmate_after_label: 'Sesudah',
    cvmate_final_cta_title: 'Siap Memulai Karier Impian Anda?',
    cvmate_final_cta_desc: 'Buat CV profesional dalam hitungan menit dengan pembuat CV bertenaga AI CVMate. Mulai gratis hari ini.',
    cvmate_final_cta_button: 'Buat CV Profesional Anda Sekarang',
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
