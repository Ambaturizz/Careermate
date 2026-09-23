import { useState, useEffect } from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-lg shadow-lg border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="CareerMate home">
            <BrandMark className="h-9 w-9" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CareerMate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-foreground hover:text-primary transition-colors">
              {t('nav_features')}
            </a>
            <a href="/#pricing" className="text-foreground hover:text-primary transition-colors">
              {t('nav_pricing')}
            </a>
            <Link to="/jobmate" className="text-foreground hover:text-primary transition-colors">
              JobMate
            </Link>
            <Link to="/interviewmate" className="text-foreground hover:text-primary transition-colors">
              {t('nav_interview')}
            </Link>
            <a href="/#about" className="text-foreground hover:text-primary transition-colors">
              {t('nav_about')}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full"
            >
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
            </Button>

            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" className="hidden lg:inline-flex">
              <Link to="/login">{t('nav_login')}</Link>
            </Button>
            <Button asChild className="bg-gradient-primary">
              <Link to="/cvmate">Review CV</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
