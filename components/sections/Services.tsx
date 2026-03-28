'use client';

import { motion } from 'framer-motion';
import { Calculator, Target, Shield, Zap, TrendingUp, CheckCircle } from 'lucide-react';

const services = [
  {
    icon: Calculator,
    title: 'Cost Estimation',
    description: 'Accurate and detailed cost estimates for construction projects using industry standards and market data.',
  },
  {
    icon: Target,
    title: 'Budget Planning',
    description: 'Comprehensive budget planning and allocation strategies to maximize project value and minimize waste.',
  },
  {
    icon: CheckCircle,
    title: 'Contract Administration',
    description: 'Professional contract management and administration ensuring compliance and optimal project execution.',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Identification and mitigation of financial risks throughout the project lifecycle.',
  },
  {
    icon: TrendingUp,
    title: 'Value Engineering',
    description: 'Strategic approaches to optimize project costs without compromising quality and functionality.',
  },
  {
    icon: Zap,
    title: 'Project Control',
    description: 'Real-time monitoring and control of project costs, schedules, and resource allocation.',
  },
];

export function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Services</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive quantity surveying solutions tailored to your project needs
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 rounded-lg bg-background border border-border hover-glow"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4"
                >
                  <Icon size={24} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
