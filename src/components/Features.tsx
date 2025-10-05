import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Briefcase, Video, FolderOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: FileText,
      key: 'cvmate',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Briefcase,
      key: 'jobmate',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Video,
      key: 'interviewmate',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: FolderOpen,
      key: 'documate',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      key: 'insightmate',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('features_title')}</h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                  <CardContent className="p-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6`}
                    >
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {t(`${feature.key}_title`)}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">
                      {t(`${feature.key}_description`)}
                    </p>

                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      className="h-1 bg-gradient-primary mt-6 rounded-full"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
