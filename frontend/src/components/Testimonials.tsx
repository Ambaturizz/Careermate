import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const { t } = useLanguage();
  const testimonials = [
    { name: 'Andi Pratama', role: 'Software Engineer', company: 'Tech Startup', content: 'CareerMate helped me land my dream job! The CV builder and interview practice were game-changers.', rating: 5, avatar: '👨‍💻' },
    { name: 'Siti Nurhaliza', role: 'Marketing Specialist', company: 'Digital Agency', content: 'The job matching feature is incredible. I found opportunities I would have never discovered on my own.', rating: 5, avatar: '👩‍💼' },
    { name: 'Budi Santoso', role: 'Data Analyst', company: 'Financial Services', content: 'Interview practice with AI feedback boosted my confidence tremendously. Highly recommended!', rating: 5, avatar: '👨‍🔬' },
  ];

  return (
    <section className="py-24 bg-background"><div className="container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-bold mb-4">{t('testimonials_title')}</h2><div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full" /></motion.div>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {testimonials.map((testimonial, index) => <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}><Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"><CardContent className="p-8"><Quote className="w-10 h-10 text-primary/20 mb-4" /><div className="flex mb-4">{[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-accent text-accent" />)}</div><p className="text-muted-foreground mb-6 leading-relaxed italic">&quot;{testimonial.content}&quot;</p><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-2xl">{testimonial.avatar}</div><div><p className="font-semibold">{testimonial.name}</p><p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p></div></div></CardContent></Card></motion.div>)}
      </div>
    </div></section>
  );
};

export default Testimonials;
