import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ProblemSolution = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-destructive">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">The Problem</h3>
            </div>
            <h2 className="text-4xl font-bold">{t('problem_title')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('problem_description')}
            </p>
            <div className="space-y-3 pt-4">
              {['Lack of professional CV templates', 'No interview practice tools', 'Scattered job search platforms', 'Unorganized career documents'].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-accent">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">The Solution</h3>
            </div>
            <h2 className="text-4xl font-bold">{t('solution_title')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('solution_description')}
            </p>
            <div className="space-y-3 pt-4">
              {['AI-powered CV builder', 'Smart interview simulator', 'Personalized job matching', 'Secure cloud storage'].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3 text-foreground"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
