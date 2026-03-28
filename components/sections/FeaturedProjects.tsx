'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface FeaturedProjectItem {
  _id: string;
  title: string;
  slug: string;
  shortSummary?: string;
  coverImage?: string;
  features?: [string, ...string[]];
  budgetScope?: { min?: number; max?: number; currency?: string };
  timeline?: { startDate?: string; endDate?: string };
}

export function FeaturedProjects() {
  const [projects, setProjects] = useState<FeaturedProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/projects?featured=true&limit=6');
        if (!res.ok) throw new Error('Could not load featured projects');
        const data = await res.json();
        setProjects(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Failed to load featured projects', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Featured Projects</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Showcasing successful quantity surveying and project control engagements
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <p className="text-muted-foreground">Loading featured projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No featured projects available.</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
          >
            {projects.map((project) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-xl border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="relative h-48 overflow-hidden bg-card">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-6 bg-card/80 backdrop-blur">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.shortSummary || 'No summary available.'}</p>

                  <div className="space-y-2 mb-4">
                    {project.features && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{project.features.join(', ')}</span>
                      </div>
                    )}
                    {project.budgetScope && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">
                          ₦{project.budgetScope.min?.toLocaleString() || '0'} - ₦{project.budgetScope.max?.toLocaleString() || '0'}
                        </span>
                      </div>
                    )}
                    {project.timeline?.startDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{new Date(project.timeline.startDate).getFullYear()}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 text-primary hover:gap-3 transition-all text-sm font-semibold"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Link
            href="/projects"
            className="px-8 py-3 bg-primary/10 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all font-semibold flex items-center gap-2"
          >
            View All Projects
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ArrowRight size={20} />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
