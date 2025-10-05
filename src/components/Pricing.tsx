import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Pricing = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t('pricing_free'),
      price: t('pricing_free_price'),
      features: [
        'Basic CV Builder',
        '5 Job Applications/month',
        '3 Interview Practices/month',
        '1GB Document Storage',
        'Basic Market Insights',
      ],
      cta: t('pricing_cta_free'),
      popular: false,
    },
    {
      name: t('pricing_premium'),
      price: t('pricing_premium_price'),
      features: [
        'Advanced AI CV Builder',
        'Unlimited Job Applications',
        'Unlimited Interview Practice',
        '50GB Document Storage',
        'Advanced Market Insights',
        'Priority Support',
        'Resume Analytics',
        'Custom Templates',
      ],
      cta: t('pricing_cta_premium'),
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('pricing_title')}</h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card
                className={`relative h-full ${
                  plan.popular
                    ? 'border-primary border-2 shadow-2xl scale-105'
                    : 'border-2'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.price !== '$0' && (
                      <span className="text-muted-foreground">{t('pricing_per_month')}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-center gap-3"
                      >
                        <div className={`rounded-full p-1 ${plan.popular ? 'bg-primary' : 'bg-accent'}`}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular ? 'bg-gradient-primary' : 'bg-gradient-success'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
