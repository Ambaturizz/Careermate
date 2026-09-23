import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Coins, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Pricing = () => {
  const { t } = useLanguage();
  const plans = [
    { name: t('pricing_free'), price: t('pricing_free_price'), features: [t('pricing_free_feature_1'), t('pricing_free_feature_2'), t('pricing_free_feature_3'), t('pricing_free_feature_4')], cta: t('pricing_cta_free'), popular: false },
    { name: t('pricing_medium'), price: t('pricing_medium_price'), features: [t('pricing_medium_feature_1'), t('pricing_medium_feature_2'), t('pricing_medium_feature_3'), t('pricing_medium_feature_4'), t('pricing_medium_feature_5')], cta: t('pricing_cta_medium'), popular: true },
    { name: t('pricing_premium'), price: t('pricing_premium_price'), features: [t('pricing_premium_feature_1'), t('pricing_premium_feature_2'), t('pricing_premium_feature_3'), t('pricing_premium_feature_4'), t('pricing_premium_feature_5')], cta: t('pricing_cta_premium'), popular: false },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-bold mb-4">{t('pricing_title')}</h2><div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full" /></motion.div>
        <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }}>
              <Card className={`relative h-full ${plan.popular ? 'border-primary border-2 shadow-2xl scale-105' : 'border-2'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" />{t('pricing_popular')}</div>}
                <CardHeader className="text-center pb-8 pt-8"><h3 className="text-2xl font-bold mb-4">{plan.name}</h3><div className="flex items-baseline justify-center gap-1"><span className="text-5xl font-bold">{plan.price}</span>{plan.price !== t('pricing_free_price') && <span className="text-muted-foreground">{t('pricing_per_month')}</span>}</div></CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-4">{plan.features.map((feature, idx) => <motion.li key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * idx }} className="flex items-center gap-3"><div className={`rounded-full p-1 ${plan.popular ? 'bg-primary' : 'bg-accent'}`}><Check className="w-4 h-4 text-white" /></div><span className="text-sm">{feature}</span></motion.li>)}</ul>
                  <Button className={`w-full ${plan.popular ? 'bg-gradient-primary' : ''}`} variant={plan.popular ? 'default' : 'outline'} size="lg" disabled title="Checkout paket belum tersedia">{plan.cta}</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mt-10 flex max-w-5xl flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><Coins className="h-6 w-6" /></div><div className="flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{t('pricing_token_title')}</h3><span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t('pricing_token_badge')}</span></div><p className="text-sm text-muted-foreground">{t('pricing_token_desc')}</p></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
