import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ProblemSolution = () => {
  const { t } = useLanguage();
  const problems = [1, 2, 3, 4].map((number) => ({ title: t(`problem_stat_${number}_title`), description: t(`problem_stat_${number}_desc`) }));
  const solutions = [1, 2, 3, 4].map((number) => t(`solution_item_${number}`));

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 text-destructive"><AlertCircle className="w-6 h-6" /><h3 className="text-sm font-semibold uppercase tracking-wide">{t('problem_label')}</h3></div>
            <h2 className="text-4xl font-bold">{t('problem_title')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('problem_description')}</p>
            <div className="space-y-3 pt-4">
              {problems.map((item, index) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * index }} className="flex items-start gap-3 rounded-xl border border-destructive/15 bg-destructive/5 p-4">
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                  <div><p className="font-semibold text-foreground">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 text-accent"><CheckCircle2 className="w-6 h-6" /><h3 className="text-sm font-semibold uppercase tracking-wide">{t('solution_label')}</h3></div>
            <h2 className="text-4xl font-bold">{t('solution_title')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('solution_description')}</p>
            <div className="space-y-3 pt-4">
              {solutions.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * index }} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-accent" /><span className="font-medium">{item}</span>
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
