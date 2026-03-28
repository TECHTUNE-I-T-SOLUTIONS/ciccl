'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Character animation variants for name
  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.05,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-5 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <div className="w-full max-w-full relative z-10">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Heading with Character Animation */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2 lg:gap-4">
              {'CICCL'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-5xl sm:text-6xl lg:text-8xl font-bold text-balance leading-tight inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Owner Image & Info */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8"
          >
            {/* Image Placeholder */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="relative w-60 h-60 md:w-60 md:h-60 rounded-2xl overflow-hidden border-2 border-primary/30 bg-card/50 backdrop-blur-sm shadow-lg">
                <Image
                  src="/logo.png"
                  alt="Owner Image"
                  fill
                  className="object-cover"
                />
              </div>
              <motion.div
                className="absolute -bottom-2 -right-2 bg-primary text-background px-4 py-2 rounded-full text-sm font-semibold"
                whileHover={{ scale: 1.1 }}
              >
                ✓ Certified
              </motion.div>
            </motion.div>

            {/* Description Box */}
            <motion.div
              variants={itemVariants}
              className="max-w-md space-y-4"
            >
              <p className="text-lg sm:text-xl font-semibold text-primary">
                CURING INFRASTRUCTURE AND CONSTRUCTION COMPANY LIMITED
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                8+ years of experience delivering expert cost planning, budget management, and project control solutions across Nigeria's construction industry.
              </p>
              <ul className="space-y-2">
                {[
                  'Cost Estimation & Planning',
                  'Project Control Systems',
                  'Contract Administration',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle size={18} className="text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Subheading */}
          <motion.div variants={itemVariants}>
            <p className="text-xl sm:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto">
              Cost Planning | Project Control | Budget Management
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 max-w-3xl mx-auto w-full"
          >
            {[
              { value: '8+', label: 'Years Experience' },
              { value: '40+', label: 'Projects Completed' },
              { value: 'N1B+', label: 'Budget Managed' },
              { value: '100%', label: 'Satisfaction Rate' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-lg bg-gradient-to-br from-card/80 to-card/50 backdrop-blur border border-primary/20 hover:border-primary/50 transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/projects"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-orange-700 transition-all flex items-center gap-2 group shadow-lg hover:shadow-xl hover:shadow-primary/30"
              >
                View Portfolio
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all shadow-lg hover:shadow-xl hover:shadow-primary/30"
              >
                Get Consultation
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex justify-center mt-12"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-muted-foreground text-sm"
            >
              <svg
                className="w-6 h-6 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
