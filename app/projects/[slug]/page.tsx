'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

export default function ProjectDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${slug}`);
      if (!response.ok) throw new Error('Project not found');
      const data = await response.json();
      setProject(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full bg-background">
        <Navbar />
        <div className="w-full max-w-full pt-28 pb-20 px-4">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="w-full bg-background">
        <Navbar />
        <div className="w-full max-w-full pt-28 pb-20 px-4">
          <div className="text-center text-muted-foreground">Project not found</div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="w-full bg-background">
      <Navbar />
      <div className="w-full max-w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero Image */}
          {project.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden h-96 bg-card">
              <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
          <p className="text-xl text-muted-foreground mb-8">{project.shortSummary}</p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.hashtags.map((tag: string) => (
              <span key={tag} className="text-sm bg-primary/20 text-primary px-3 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
              </section>

              {/* Problems Solved */}
              {project.problemsSolved?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Problems Solved</h2>
                  <ul className="space-y-2">
                    {project.problemsSolved.map((problem: string, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-primary">✓</span>
                        <span>{problem}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Features */}
              {project.features?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {project.features.map((feature: string, i: number) => (
                      <div key={i} className="p-4 bg-card rounded-lg border border-border">
                        {feature}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Deliverables */}
              {project.deliverables?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Deliverables</h2>
                  <ul className="space-y-2">
                    {project.deliverables.map((deliverable: string, i: number) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-primary">→</span>
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Budget */}
              <div className="p-6 bg-card rounded-lg border border-border mb-6">
                <h3 className="font-semibold mb-3">Budget Scope</h3>
                <p className="text-2xl font-bold text-primary mb-2">
                  {project.budgetScope.currency} {project.budgetScope.min.toLocaleString()} - {project.budgetScope.max.toLocaleString()}
                </p>
              </div>

              {/* Timeline */}
              <div className="p-6 bg-card rounded-lg border border-border mb-6">
                <h3 className="font-semibold mb-3">Timeline</h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(project.timeline.startDate).toLocaleDateString()} - {new Date(project.timeline.endDate).toLocaleDateString()}
                </p>
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/2347034356398?text=I'm interested in ${project.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-6 py-3 bg-primary text-background rounded-lg font-medium hover:bg-secondary transition text-center block"
              >
                Contact About Project
              </a>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
      <MobileNav />
    </main>
  );
}
