'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';

interface ProjectDetailClientProps {
  project: any;
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const allImages = project
    ? [project.coverImage, ...(project.images || [])].filter(Boolean)
    : [];

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const goNext = () => {
    setGalleryIndex((prev) => (prev + 1) % allImages.length);
  };

  const goPrev = () => {
    setGalleryIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!galleryOpen) return;
      if (e.key === 'Escape') setGalleryOpen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen, allImages.length]);

  return (
    <main className="w-full bg-background">
      <Navbar />
      <div className="w-full max-w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero Image */}
          {project.coverImage && (
            <div
              className="mb-8 rounded-lg overflow-hidden h-96 bg-card relative group cursor-pointer"
              onClick={() => openGallery(0)}
            >
              <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
              {allImages.length > 1 && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-lg font-medium">
                    <Images className="w-6 h-6" />
                    View All {allImages.length} Images
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
          <p className="text-xl text-muted-foreground mb-8">{project.shortSummary}</p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {project.hashtags?.map((tag: string) => (
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

              {/* Image Gallery Grid */}
              {allImages.length > 1 && (
                <section>
                  <h2 className="text-2xl font-bold mb-4">Project Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allImages.map((img: string, i: number) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => openGallery(i)}
                        className="rounded-lg overflow-hidden bg-card border border-border aspect-video relative group"
                      >
                        <img src={img} alt={`${project.title} image ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Budget */}
              {project.budgetScope && (
                <div className="p-6 bg-card rounded-lg border border-border mb-6">
                  <h3 className="font-semibold mb-3">Budget Scope</h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {project.budgetScope.currency} {project.budgetScope.min?.toLocaleString()} - {project.budgetScope.max?.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Timeline */}
              {project.timeline && (
                <div className="p-6 bg-card rounded-lg border border-border mb-6">
                  <h3 className="font-semibold mb-3">Timeline</h3>
                  <p className="text-muted-foreground text-sm">
                    {new Date(project.timeline.startDate).toLocaleDateString()} - {new Date(project.timeline.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}

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

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setGalleryOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setGalleryOpen(false)}
              title="Close gallery"
              aria-label="Close gallery"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 text-white/70 text-sm">
              {galleryIndex + 1} / {allImages.length}
            </div>

            {/* Previous button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                title="Previous image"
                aria-label="Previous image"
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={galleryIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={allImages[galleryIndex]}
              alt={`${project.title} image ${galleryIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                title="Next image"
                aria-label="Next image"
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setGalleryIndex(i); }}
                    title={`Go to image ${i + 1}`}
                    aria-label={`Go to image ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === galleryIndex
                        ? 'bg-primary w-6'
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <MobileNav />
    </main>
  );
}
