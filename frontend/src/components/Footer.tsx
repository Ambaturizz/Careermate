import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

const Footer = () => {
  const { t } = useLanguage();
  const footerLinks = { product: ['CVMate', 'JobMate', 'InterviewMate', 'DocuMate', 'InsightMate'], company: ['About Us', 'Careers', 'Blog', 'Press'], support: ['Help Center', 'Contact', 'FAQ', 'Community'], legal: ['Privacy', 'Terms', 'Security', 'Cookies'] };
  const socialLinks = [{ icon: Facebook, href: '#', label: 'Facebook' }, { icon: Twitter, href: '#', label: 'Twitter' }, { icon: Instagram, href: '#', label: 'Instagram' }, { icon: Linkedin, href: '#', label: 'LinkedIn' }, { icon: Mail, href: '#', label: 'Email' }];

  return (
    <footer id="about" className="bg-card border-t border-border scroll-mt-24"><div className="container mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
        <div className="lg:col-span-2"><div className="flex items-center gap-2.5 mb-3"><BrandMark className="h-9 w-9" /><h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">CareerMate</h3></div><p className="text-muted-foreground mb-6">{t('footer_tagline')}</p><div className="flex gap-4">{socialLinks.map((social) => { const Icon = social.icon; return <a key={social.label} href={social.href} aria-label={social.label} className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"><Icon className="w-5 h-5" /></a>; })}</div></div>
        {Object.entries(footerLinks).map(([category, links]) => <div key={category}><h4 className="font-semibold mb-4 capitalize">{t(`footer_${category}`)}</h4><ul className="space-y-2">{links.map((link) => <li key={link}><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{link}</a></li>)}</ul></div>)}
      </div>
      <div className="border-t border-border pt-8 text-center md:text-left"><p className="text-sm text-muted-foreground">© {new Date().getFullYear()} CareerMate. All rights reserved.</p></div>
    </div></footer>
  );
};

export default Footer;
