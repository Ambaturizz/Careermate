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
    { name: 'Modern Professional', type: 'ATS-Friendly', color: 'from-primary to-primary/80' },
    { name: 'Creative Designer', type: 'Creative', color: 'from-accent to-accent/80' },
    { name: 'Tech Minimalist', type: 'ATS-Friendly', color: 'from-primary/70 to-primary/50' },
    { name: 'Executive Classic', type: 'Professional', color: 'from-foreground/80 to-foreground/60' },
    { name: 'Bold Statement', type: 'Creative', color: 'from-accent/70 to-primary/70' },
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

          {/* Animated CV Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl -z-10 animate-pulse-glow" />
            <Card className="p-8 backdrop-blur-sm bg-card/95 shadow-glass">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-4 bg-primary/20 rounded"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-4 bg-primary/20 rounded"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-4 bg-primary/20 rounded"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                  className="flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                      95%
                    </div>
                    <p className="text-sm text-muted-foreground">ATS Score</p>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Why CVMate Section */}
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
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
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

      {/* Template Gallery */}
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

          <div className="overflow-x-auto pb-8">
            <div className="flex gap-6 min-w-max px-4">
              {templates.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Card className="w-64 h-80 overflow-hidden group">
                    <div className={`h-full bg-gradient-to-br ${template.color} p-6 relative`}>
                      <div className="absolute top-4 right-4">
                        <span className="text-xs bg-white/90 text-foreground px-2 py-1 rounded-full">
                          {template.type}
                        </span>
                      </div>
                      <div className="space-y-4 mt-12">
                        <div className="h-3 bg-white/30 rounded w-3/4" />
                        <div className="h-3 bg-white/30 rounded w-1/2" />
                        <div className="h-2 bg-white/20 rounded w-full" />
                        <div className="h-2 bg-white/20 rounded w-5/6" />
                      </div>
                      <div className="absolute bottom-4 left-6 right-6">
                        <p className="text-white font-semibold">{template.name}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t('cvmate_before_after_title')}</h2>
          </motion.div>

          <Card className="p-8">
            <div className="relative overflow-hidden rounded-lg" style={{ height: '500px' }}>
              {/* Before - Left Side */}
              <div 
                className="absolute top-0 left-0 bottom-0 bg-muted/50 p-8 overflow-hidden"
                style={{ width: `${comparison[0]}%` }}
              >
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-destructive mb-4">{t('cvmate_before_label')}</div>
                  <div className="h-4 bg-destructive/20 rounded w-3/4" />
                  <div className="h-3 bg-destructive/10 rounded w-full" />
                  <div className="h-3 bg-destructive/10 rounded w-5/6" />
                  <div className="h-3 bg-destructive/10 rounded w-4/5" />
                  <div className="space-y-2 mt-6">
                    <div className="h-2 bg-destructive/10 rounded" />
                    <div className="h-2 bg-destructive/10 rounded" />
                    <div className="h-2 bg-destructive/10 rounded w-3/4" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-4 space-y-1">
                    <p>❌ Poor formatting</p>
                    <p>❌ No ATS optimization</p>
                    <p>❌ Missing keywords</p>
                  </div>
                </div>
              </div>

              {/* After - Right Side */}
              <div 
                className="absolute top-0 right-0 bottom-0 bg-accent/10 p-8"
                style={{ width: `${100 - comparison[0]}%` }}
              >
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-accent mb-4">{t('cvmate_after_label')}</div>
                  <div className="h-4 bg-accent/30 rounded w-3/4" />
                  <div className="h-3 bg-accent/20 rounded w-full" />
                  <div className="h-3 bg-accent/20 rounded w-5/6" />
                  <div className="h-3 bg-accent/20 rounded w-4/5" />
                  <div className="space-y-2 mt-6">
                    <div className="h-2 bg-accent/20 rounded" />
                    <div className="h-2 bg-accent/20 rounded" />
                    <div className="h-2 bg-accent/20 rounded w-3/4" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-4 space-y-1">
                    <p>✅ Professional design</p>
                    <p>✅ ATS-optimized</p>
                    <p>✅ AI-enhanced content</p>
                  </div>
                </div>
              </div>

              {/* Slider Handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-primary z-10"
                style={{ left: `${comparison[0]}%` }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-1 h-4 bg-white rounded" />
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
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
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
              className="text-lg px-8"
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