import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, FileText, Sparkles, TrendingUp, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CVMate = () => {
  const { t } = useLanguage();
  const [cvScore, setCvScore] = useState(45);
  const [comparison, setComparison] = useState([50]);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  const features = [
    {
      icon: CheckCircle2,
      title: t('cvmate_ats_title'),
      description: t('cvmate_ats_desc'),
    },
    {
      icon: FileText,
      title: t('cvmate_design_title'),
      description: t('cvmate_design_desc'),
    },
    {
      icon: Sparkles,
      title: t('cvmate_ai_title'),
      description: t('cvmate_ai_desc'),
    },
    {
      icon: TrendingUp,
      title: t('cvmate_analytics_title'),
      description: t('cvmate_analytics_desc'),
    },
  ];

  const templates = [
    { 
      name: 'The Corporate', 
      type: 'ATS-Friendly',
      style: 'corporate',
      description: 'Classic serif, dense layout for banking/legal'
    },
    { 
      name: 'The Creative', 
      type: 'Creative',
      style: 'creative',
      description: 'Sidebar design with color accents'
    },
    { 
      name: 'The Minimalist', 
      type: 'ATS-Friendly',
      style: 'minimalist',
      description: 'Clean whitespace, modern sans-serif'
    },
    { 
      name: 'The Tech', 
      type: 'Developer',
      style: 'tech',
      description: 'Skills-focused with progress indicators'
    },
  ];

  const hotspots = [
    {
      id: 1,
      title: 'AI Keyword Optimization',
      description: 'Our AI analyzes job descriptions and suggests relevant keywords to improve your ATS score.',
      top: '25%',
      left: '15%',
    },
    {
      id: 2,
      title: 'Smart Content Suggestions',
      description: 'Get AI-powered suggestions to make your experience stand out to recruiters.',
      top: '45%',
      left: '20%',
    },
    {
      id: 3,
      title: 'Impact Measurement',
      description: 'Quantify your achievements with our AI assistant for maximum impact.',
      top: '65%',
      left: '18%',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {t('cvmate_hero_title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('cvmate_hero_subtitle')}
            </p>
            <Button size="lg" className="text-lg px-8">
              {t('cvmate_hero_cta')}
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>

          {/* Real Product Mockup - Laptop with Split Editor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10 animate-pulse-glow" />
            
            {/* Laptop Frame */}
            <div className="relative bg-gradient-to-b from-foreground/5 to-foreground/10 rounded-3xl p-3 shadow-2xl">
              {/* Screen */}
              <div className="bg-background rounded-2xl overflow-hidden border border-border/50">
                {/* Browser Chrome */}
                <div className="h-8 bg-muted/50 flex items-center px-4 gap-2 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-accent/70" />
                  </div>
                  <div className="flex-1 mx-4 h-5 bg-background/50 rounded flex items-center px-3">
                    <span className="text-xs text-muted-foreground">cvmate.app/editor</span>
                  </div>
                </div>
                
                {/* Split Screen Editor */}
                <div className="grid md:grid-cols-2 divide-x divide-border/30">
                  {/* Left: Form Editor */}
                  <div className="p-6 space-y-4 bg-muted/20">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Edit Details</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Full Name</div>
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "70%" }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="h-3 bg-foreground/20 rounded"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Job Title</div>
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 0.8, delay: 0.7 }}
                          className="h-3 bg-foreground/20 rounded"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Professional Summary</div>
                        <div className="space-y-1">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, delay: 0.9 }}
                            className="h-2 bg-foreground/15 rounded"
                          />
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "95%" }}
                            transition={{ duration: 0.8, delay: 1.1 }}
                            className="h-2 bg-foreground/15 rounded"
                          />
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "80%" }}
                            transition={{ duration: 0.8, delay: 1.3 }}
                            className="h-2 bg-foreground/15 rounded"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Suggestion Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5 }}
                      className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/30 rounded-lg mt-4"
                    >
                      <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium mb-1">AI Suggestion</p>
                        <p className="text-xs text-muted-foreground">Use action verbs like "Led" or "Managed"</p>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Right: Live Preview */}
                  <div className="p-6 bg-background">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold">Live Preview</span>
                    </div>
                    
                    <div className="space-y-3 p-4 bg-card rounded-lg border border-border/50">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="h-4 bg-foreground/30 rounded w-3/4"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="h-3 bg-foreground/20 rounded w-2/3"
                      />
                      <div className="pt-2 space-y-1">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.0 }}
                          className="h-2 bg-foreground/10 rounded w-full"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="h-2 bg-foreground/10 rounded w-11/12"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.4 }}
                          className="h-2 bg-foreground/10 rounded w-4/5"
                        />
                      </div>
                      
                      {/* ATS Score Indicator */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.6, type: "spring" }}
                        className="flex items-center justify-between pt-3 mt-3 border-t border-border/30"
                      >
                        <span className="text-xs text-muted-foreground">ATS Score</span>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                            95%
                          </div>
                          <TrendingUp className="w-4 h-4 text-accent" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Laptop Base */}
              <div className="h-2 bg-gradient-to-b from-foreground/10 to-foreground/5 rounded-b-xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase - Real UI Snippets */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t('cvmate_why_title')}</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: ATS Optimizer - Real Score Meter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="mb-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">ATS Score</span>
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-3xl font-bold text-accent mb-2">85%</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Keywords optimized</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>Format ATS-friendly</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{features[0].title}</h3>
                <p className="text-muted-foreground">{features[0].description}</p>
              </Card>
            </motion.div>

            {/* Feature 2: AI Suggestions - Tooltip Example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20 relative">
                  <div className="h-3 bg-foreground/10 rounded w-full mb-2" />
                  <div className="h-3 bg-foreground/10 rounded w-3/4" />
                  
                  {/* AI Tooltip */}
                  <div className="absolute -top-2 -right-2 bg-accent text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Use "Managed" instead</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{features[2].title}</h3>
                <p className="text-muted-foreground">{features[2].description}</p>
              </Card>
            </motion.div>

            {/* Feature 3: Professional Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="mb-4 p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <div className="w-12 h-12 rounded bg-primary/20" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-foreground/20 rounded w-3/4" />
                      <div className="h-2 bg-foreground/10 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-foreground/10 rounded" />
                    <div className="h-1.5 bg-foreground/10 rounded w-5/6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{features[1].title}</h3>
                <p className="text-muted-foreground">{features[1].description}</p>
              </Card>
            </motion.div>

            {/* Feature 4: Export Options - Dropdown UI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between p-2 bg-primary text-primary-foreground rounded mb-2">
                    <span className="text-sm font-medium">Download CV</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="p-2 bg-background rounded hover:bg-accent/10 transition-colors flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <span>Export as PDF</span>
                    </div>
                    <div className="p-2 bg-background rounded hover:bg-accent/10 transition-colors flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <span>Export as Word</span>
                    </div>
                    <div className="p-2 bg-background rounded hover:bg-accent/10 transition-colors flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <span>Share Link</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{features[3].title}</h3>
                <p className="text-muted-foreground">{features[3].description}</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section ref={containerRef} className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            style={{ opacity, scale }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t('cvmate_demo_title')}</h2>
            <p className="text-xl text-muted-foreground">{t('cvmate_demo_subtitle')}</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* CV Editor Mockup */}
            <div className="lg:col-span-2">
              <Card className="p-8 relative overflow-hidden">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-foreground/10 rounded w-48" />
                      <div className="h-4 bg-foreground/5 rounded w-64" />
                    </div>
                  </div>

                  {/* Experience Section with Hotspots */}
                  {hotspots.map((hotspot) => (
                    <div key={hotspot.id} className="relative">
                      <div className="flex gap-2 mb-2">
                        <div className="h-4 bg-foreground/10 rounded flex-1" />
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="group">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
                              >
                                <Info className="w-4 h-4 text-primary" />
                              </motion.div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">{hotspot.title}</h4>
                              <p className="text-sm text-muted-foreground">{hotspot.description}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-foreground/5 rounded w-full" />
                        <div className="h-3 bg-foreground/5 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Suggestion Overlay */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute top-4 right-4 bg-accent/10 border border-accent/30 rounded-lg p-4 max-w-xs"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">AI Suggestion</p>
                      <p className="text-xs text-muted-foreground">
                        Add quantifiable metrics to increase impact by 40%
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Card>
            </div>

            {/* Live Score Panel */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t('cvmate_score_label')}</h3>
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-6xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent"
                  >
                    {cvScore}%
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>ATS Optimization</span>
                      <span className="text-accent">90%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "90%" }}
                        transition={{ delay: 0.7, duration: 1 }}
                        className="h-full bg-gradient-to-r from-accent to-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Content Quality</span>
                      <span className="text-accent">85%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ delay: 0.9, duration: 1 }}
                        className="h-full bg-gradient-to-r from-accent to-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Formatting</span>
                      <span className="text-accent">95%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "95%" }}
                        transition={{ delay: 1.1, duration: 1 }}
                        className="h-full bg-gradient-to-r from-accent to-primary"
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6" 
                  onClick={() => setCvScore(Math.min(100, cvScore + 10))}
                >
                  Improve Score
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Template Gallery - Distinct Real CV Layouts */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t('cvmate_templates_title')}</h2>
            <p className="text-xl text-muted-foreground">{t('cvmate_templates_subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group cursor-pointer"
              >
                <Card className="overflow-hidden h-[420px] relative shadow-lg hover:shadow-2xl transition-all">
                  {/* Template Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-xs bg-background/95 backdrop-blur-sm text-foreground px-3 py-1 rounded-full border border-border/50 shadow-sm">
                      {template.type}
                    </span>
                  </div>

                  {/* Template Preview based on style */}
                  {template.style === 'corporate' && (
                    <div className="h-full bg-background p-6">
                      {/* Classic Serif Layout */}
                      <div className="text-center border-b-2 border-foreground pb-4 mb-4">
                        <div className="h-5 bg-foreground/90 rounded w-2/3 mx-auto mb-2" />
                        <div className="h-3 bg-foreground/50 rounded w-1/2 mx-auto" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="h-3 bg-foreground/80 rounded w-1/3 mb-2 font-serif" />
                          <div className="space-y-1 pl-2">
                            <div className="h-2 bg-foreground/20 rounded w-full" />
                            <div className="h-2 bg-foreground/20 rounded w-11/12" />
                            <div className="h-2 bg-foreground/20 rounded w-10/12" />
                          </div>
                        </div>
                        <div>
                          <div className="h-3 bg-foreground/80 rounded w-2/5 mb-2" />
                          <div className="space-y-1 pl-2">
                            <div className="h-2 bg-foreground/20 rounded w-full" />
                            <div className="h-2 bg-foreground/20 rounded w-5/6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {template.style === 'creative' && (
                    <div className="h-full flex">
                      {/* Sidebar with accent */}
                      <div className="w-1/3 bg-primary p-4 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-background/90 mx-auto" />
                        <div className="space-y-2">
                          <div className="h-2 bg-background/70 rounded" />
                          <div className="h-2 bg-background/70 rounded w-4/5" />
                        </div>
                        <div className="pt-4 space-y-2">
                          <div className="h-2 bg-background/50 rounded" />
                          <div className="h-2 bg-background/50 rounded" />
                          <div className="h-2 bg-background/50 rounded w-3/4" />
                        </div>
                      </div>
                      {/* Main content */}
                      <div className="flex-1 bg-background p-4 space-y-3">
                        <div className="h-4 bg-primary/80 rounded w-2/3" />
                        <div className="h-3 bg-foreground/30 rounded w-1/2" />
                        <div className="space-y-1 pt-2">
                          <div className="h-2 bg-foreground/20 rounded" />
                          <div className="h-2 bg-foreground/20 rounded w-11/12" />
                          <div className="h-2 bg-foreground/20 rounded w-10/12" />
                        </div>
                      </div>
                    </div>
                  )}

                  {template.style === 'minimalist' && (
                    <div className="h-full bg-background p-8 space-y-6">
                      {/* Clean minimal layout */}
                      <div className="space-y-2">
                        <div className="h-6 bg-foreground/90 rounded w-1/2" />
                        <div className="h-3 bg-foreground/40 rounded w-1/3" />
                      </div>
                      <div className="h-px bg-foreground/20 my-6" />
                      <div className="space-y-4">
                        <div>
                          <div className="h-3 bg-foreground/60 rounded w-1/4 mb-3" />
                          <div className="space-y-2">
                            <div className="h-2 bg-foreground/15 rounded w-full" />
                            <div className="h-2 bg-foreground/15 rounded w-4/5" />
                          </div>
                        </div>
                        <div>
                          <div className="h-3 bg-foreground/60 rounded w-1/4 mb-3" />
                          <div className="space-y-2">
                            <div className="h-2 bg-foreground/15 rounded w-full" />
                            <div className="h-2 bg-foreground/15 rounded w-11/12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {template.style === 'tech' && (
                    <div className="h-full bg-background p-5 space-y-4">
                      {/* Tech/Developer focused */}
                      <div className="space-y-1">
                        <div className="h-4 bg-foreground/80 rounded w-2/3" />
                        <div className="h-3 bg-accent/60 rounded w-1/2" />
                      </div>
                      <div>
                        <div className="h-3 bg-foreground/70 rounded w-1/3 mb-2" />
                        <div className="flex flex-wrap gap-1.5">
                          <div className="px-2 py-1 bg-primary/20 rounded text-xs h-5 w-16" />
                          <div className="px-2 py-1 bg-primary/20 rounded text-xs h-5 w-14" />
                          <div className="px-2 py-1 bg-primary/20 rounded text-xs h-5 w-20" />
                          <div className="px-2 py-1 bg-primary/20 rounded text-xs h-5 w-12" />
                          <div className="px-2 py-1 bg-primary/20 rounded text-xs h-5 w-18" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-foreground/70 rounded w-1/4 mb-2" />
                        {[85, 70, 90, 65].map((width, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <div className="h-2 bg-foreground/30 rounded w-1/4" />
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent rounded-full" 
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      Use This Template
                    </Button>
                  </div>
                </Card>

                {/* Template Info */}
                <div className="mt-3 px-1">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Section - Real Document Comparison */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t('cvmate_before_after_title')}</h2>
            <p className="text-muted-foreground">Drag the slider to see the transformation</p>
          </motion.div>

          <Card className="p-8">
            <div className="relative overflow-hidden rounded-lg border-2 border-border" style={{ height: '500px' }}>
              {/* Before - Messy Word Document */}
              <div 
                className="absolute top-0 left-0 bottom-0 bg-muted/30 p-6 overflow-hidden"
                style={{ width: `${comparison[0]}%` }}
              >
                <div className="bg-background rounded p-6 h-full shadow-inner">
                  <div className="text-sm font-semibold text-destructive mb-4 flex items-center gap-2">
                    <span className="px-2 py-1 bg-destructive/20 rounded">BEFORE</span>
                    <span className="text-xs text-muted-foreground">Generic Word Document</span>
                  </div>
                  
                  {/* Messy unformatted content */}
                  <div className="space-y-3 font-mono text-xs">
                    <div className="space-y-1">
                      <div className="h-3 bg-destructive/30 rounded w-1/3" />
                      <div className="h-2 bg-destructive/10 rounded w-1/4 ml-2" />
                      <div className="h-2 bg-destructive/10 rounded w-1/5 ml-2" />
                    </div>
                    
                    <div className="space-y-1 mt-4">
                      <div className="h-2 bg-destructive/20 rounded w-1/4" />
                      <div className="h-2 bg-destructive/10 rounded w-full ml-1" />
                      <div className="h-2 bg-destructive/10 rounded w-11/12 ml-1" />
                      <div className="h-2 bg-destructive/10 rounded w-10/12 ml-1" />
                      <div className="h-2 bg-destructive/10 rounded w-9/12 ml-1" />
                    </div>
                    
                    <div className="space-y-1 mt-3">
                      <div className="h-2 bg-destructive/20 rounded w-1/3" />
                      <div className="h-2 bg-destructive/10 rounded w-4/5" />
                      <div className="h-2 bg-destructive/10 rounded w-3/4" />
                    </div>
                  </div>
                  
                  {/* Issues List */}
                  <div className="mt-8 p-3 bg-destructive/5 rounded border border-destructive/20">
                    <div className="text-xs font-semibold mb-2 text-destructive">Issues Detected:</div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>Inconsistent formatting & spacing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>Not ATS-compatible (tables, graphics)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>Missing industry keywords</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>Poor visual hierarchy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* After - Clean CVMate Result */}
              <div 
                className="absolute top-0 right-0 bottom-0 bg-accent/5 p-6"
                style={{ width: `${100 - comparison[0]}%` }}
              >
                <div className="bg-background rounded p-6 h-full shadow-lg border border-accent/20">
                  <div className="text-sm font-semibold text-accent mb-4 flex items-center gap-2">
                    <span className="px-2 py-1 bg-accent/20 rounded">AFTER</span>
                    <span className="text-xs text-muted-foreground">CVMate Professional</span>
                  </div>
                  
                  {/* Clean formatted content */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center pb-3 border-b-2 border-accent/30">
                      <div className="h-5 bg-accent/60 rounded w-2/3 mx-auto mb-2" />
                      <div className="h-3 bg-accent/30 rounded w-1/2 mx-auto" />
                    </div>
                    
                    {/* Section 1 */}
                    <div className="space-y-2">
                      <div className="h-3 bg-accent/50 rounded w-1/3" />
                      <div className="pl-3 space-y-1">
                        <div className="h-2 bg-accent/20 rounded w-full" />
                        <div className="h-2 bg-accent/20 rounded w-11/12" />
                        <div className="h-2 bg-accent/20 rounded w-10/12" />
                      </div>
                    </div>
                    
                    {/* Section 2 */}
                    <div className="space-y-2">
                      <div className="h-3 bg-accent/50 rounded w-2/5" />
                      <div className="pl-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-accent" />
                          <div className="h-2 bg-accent/20 rounded flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-accent" />
                          <div className="h-2 bg-accent/20 rounded w-5/6" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Success Metrics */}
                  <div className="mt-8 p-3 bg-accent/10 rounded border border-accent/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-accent">ATS Score</span>
                      <span className="text-xl font-bold text-accent">95%</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        <span>Professional layout & typography</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        <span>ATS-friendly format (no tables)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        <span>Optimized keywords detected</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        <span>Clear visual hierarchy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-primary z-10 shadow-lg"
                style={{ left: `${comparison[0]}%` }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-xl border-4 border-background cursor-ew-resize">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 bg-primary-foreground rounded" />
                    <div className="w-0.5 h-4 bg-primary-foreground rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 px-4">
              <Slider
                value={comparison}
                onValueChange={setComparison}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Drag to compare</span>
                <span>{comparison[0]}% / {100 - comparison[0]}%</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA - with Stacked CVs Background */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground relative overflow-hidden">
        {/* Blurred CV Stack Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-48 h-64 bg-primary-foreground/20 rounded-lg rotate-6 blur-sm" />
          <div className="absolute top-20 right-32 w-48 h-64 bg-primary-foreground/15 rounded-lg rotate-3 blur-sm" />
          <div className="absolute top-30 right-44 w-48 h-64 bg-primary-foreground/10 rounded-lg -rotate-2 blur-sm" />
          <div className="absolute bottom-10 left-20 w-48 h-64 bg-primary-foreground/20 rounded-lg -rotate-6 blur-sm" />
          <div className="absolute bottom-20 left-32 w-48 h-64 bg-primary-foreground/15 rounded-lg -rotate-3 blur-sm" />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('cvmate_final_cta_title')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('cvmate_final_cta_desc')}
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 shadow-xl hover:shadow-2xl transition-shadow"
            >
              {t('cvmate_final_cta_button')}
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CVMate;